import { COOKIE_NAME, ONE_YEAR_MS, OAUTH_STATE_COOKIE, OAUTH_STATE_FALLBACK_COOKIE, decodeOAuthState } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import { randomUUID } from "crypto";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getRequestOrigin(req: Request): { origin: string; secure: boolean } {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto?.split(",")[0])?.trim() || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const hostname = Array.isArray(host) ? host[0] : host;
  const secure = protocol === "https";
  return { origin: `${secure ? "https" : "http"}://${hostname}`, secure };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/start", (req: Request, res: Response) => {
    const action = getQueryParam(req, "type") === "signUp" ? "signUp" : "signIn";
    if (!ENV.appId || !ENV.oAuthServerUrl) {
      // Never expose a raw JSON/configuration error to public visitors. The
      // deployment still needs the real OAuth app ID, but the site remains
      // navigable and can explain the issue in the visitor's language.
      res.redirect(302, `/?auth=not-configured&action=${action}`);
      return;
    }

    const { origin, secure } = getRequestOrigin(req);
    const redirectUri = `${origin}/api/oauth/callback`;
    const nonce = randomUUID();
    const state = Buffer.from(JSON.stringify({ redirectUri, nonce }), "utf8").toString("base64");
    const cookieName = secure ? OAUTH_STATE_COOKIE : OAUTH_STATE_FALLBACK_COOKIE;
    res.cookie(cookieName, nonce, {
      httpOnly: true,
      path: "/",
      maxAge: 10 * 60 * 1000,
      sameSite: "lax",
      secure,
    });
    const portal = new URL(`${ENV.oAuthPortalUrl}/app-auth`);
    portal.searchParams.set("appId", ENV.appId);
    portal.searchParams.set("redirectUri", redirectUri);
    portal.searchParams.set("state", state);
    portal.searchParams.set("type", action);
    res.redirect(302, portal.toString());
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const { nonce } = decodeOAuthState(state);
    const parsedCookies = parseCookieHeader(req.headers.cookie ?? "");
    const expectedNonce = parsedCookies[OAUTH_STATE_COOKIE] ?? parsedCookies[OAUTH_STATE_FALLBACK_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "lax" });
    res.clearCookie(OAUTH_STATE_FALLBACK_COOKIE, { path: "/", secure: false, sameSite: "lax" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
