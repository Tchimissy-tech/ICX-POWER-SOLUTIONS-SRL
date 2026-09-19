import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createActionToken, consumeActionToken, upsertUser } from "./db";
import { getEmailProviderStatus } from "./emailService";
import { renderAccountCreatedEmail, renderServiceRequestEmail, renderDocumentUploadedEmail } from "./emailTemplates";

function staffContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "icxps.sale@outlook.com",
      name: "Admin ICX",
      loginMethod: "manus",
      role: "super_admin",
      accountStatus: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { host: "localhost:3000" },
    } as unknown as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

function userContext(): TrpcContext {
  return {
    user: {
      id: 99,
      openId: "applicant-user",
      email: "candidat@example.com",
      name: "Candidat Test",
      loginMethod: "manus",
      role: "user",
      accountStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { host: "localhost:3000" },
    } as unknown as TrpcContext["req"],
    res: { clearCookie: () => undefined } as unknown as TrpcContext["res"],
  };
}

describe("Email Notification and Account Approval Suite", () => {
  it("generates correct email templates for account creation with approval/rejection links", () => {
    const email = renderAccountCreatedEmail({
      userId: 42,
      userName: "Jean Dupont",
      userEmail: "jean.dupont@example.com",
      loginMethod: "email",
      createdAt: new Date(),
      approveUrl: "https://example.com/api/actions/decide?token=approve123",
      rejectUrl: "https://example.com/api/actions/decide?token=reject123",
      adminDashboardUrl: "https://example.com/admin",
    });

    expect(email.subject).toContain("Jean Dupont");
    expect(email.html).toContain("APPROUVER LE COMPTE");
    expect(email.html).toContain("REFUSER LE COMPTE");
    expect(email.html).toContain("icxps.sale@outlook.com");
  });

  it("generates correct email templates for service requests and document uploads", () => {
    const reqEmail = renderServiceRequestEmail({
      reference: "REQ-2026-TEST01",
      type: "sourcing",
      requesterName: "Entreprise Alpha",
      email: "contact@alpha.com",
      payload: { product: "Copper Cathodes", quantity: "500 MT" },
      createdAt: new Date(),
      adminDashboardUrl: "https://example.com/admin",
    });

    expect(reqEmail.subject).toContain("REQ-2026-TEST01");
    expect(reqEmail.html).toContain("Copper Cathodes");

    const docEmail = renderDocumentUploadedEmail({
      contextType: "service_request",
      reference: "REQ-2026-TEST01",
      documentType: "passport",
      originalName: "passport_scan.pdf",
      byteSize: 1024 * 500,
      mimeType: "application/pdf",
      uploaderInfo: "Entreprise Alpha (contact@alpha.com)",
      adminDashboardUrl: "https://example.com/admin",
    });

    expect(docEmail.subject).toContain("passport_scan.pdf");
    expect(docEmail.html).toContain("0.49 Mo");
  });

  it("checks provider status configuration helper", () => {
    const status = getEmailProviderStatus();
    expect(status.targetRecipient).toBe("icxps.sale@outlook.com");
    expect(["resend", "sendgrid", "smtp", "console_simulation"]).toContain(status.activeProvider);
  });

  it("processes one-click decision token through action router", async () => {
    const caller = appRouter.createCaller(staffContext());
    const token = await createActionToken("approve_user", 99);

    const decision = await caller.action.processDecision({ token });
    expect(decision.success).toBe(true);
    expect(decision.action).toBe("approve");

    // Second consumption must fail (single-use token security)
    await expect(caller.action.processDecision({ token })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("allows staff to retrieve provider status and metrics", async () => {
    const caller = appRouter.createCaller(staffContext());
    const status = await caller.admin.providerStatus();
    expect(status.targetRecipient).toBe("icxps.sale@outlook.com");

    const metrics = await caller.admin.metrics();
    expect(metrics).toHaveProperty("requests");
    expect(metrics).toHaveProperty("users");
  });

  it("forbids regular users from viewing admin provider status", async () => {
    const caller = appRouter.createCaller(userContext());
    await expect(caller.admin.providerStatus()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("requires both the confirmed email and the super_admin role", async () => {
    const context = staffContext();
    context.user = { ...context.user!, role: "admin" };
    const caller = appRouter.createCaller(context);
    await expect(caller.admin.providerStatus()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("blocks pending accounts from protected operations until approved", async () => {
    const caller = appRouter.createCaller(userContext());
    await expect(caller.application.mine()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
