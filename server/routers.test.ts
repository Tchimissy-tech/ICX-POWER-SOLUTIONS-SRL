import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function userContext(): TrpcContext {
  return {
    user: {
      id: 91,
      openId: "ordinary-user",
      email: "user@example.com",
      name: "Ordinary User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("platform protection boundaries", () => {
  it("rejects staff dashboard access for a public account", async () => {
    const caller = appRouter.createCaller(userContext());
    await expect(caller.admin.metrics()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects a service request submitted through the honeypot", async () => {
    const caller = appRouter.createCaller(userContext());
    await expect(caller.request.submit({
      type: "sourcing",
      requesterName: "Example Person",
      email: "person@example.com",
      payload: { product: "Sample" },
      website: "bot-filled-value",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns an actionable error when form persistence is unavailable", async () => {
    const caller = appRouter.createCaller(userContext());
    await expect(caller.request.submit({
      type: "contact",
      requesterName: "Example Person",
      email: "person@example.com",
      payload: { message: "Database configuration audit" },
    })).rejects.toMatchObject({ code: "PRECONDITION_FAILED", message: expect.stringContaining("DATABASE_URL") });
  });
});
