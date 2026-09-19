import {
  COOKIE_NAME,
  ONE_YEAR_MS,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_FALLBACK_COOKIE,
  decodeOAuthState,
} from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import { randomUUID } from "crypto";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";
import { sendEmail, TARGET_ADMIN_EMAIL } from "../emailService";
import { renderAccountCreatedEmail } from "../emailTemplates";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getRequestOrigin(req: Request): { origin: string; secure: boolean } {
  if (process.env.APP_BASE_URL) {
    return { origin: process.env.APP_BASE_URL.replace(/\/+$/, ""), secure: true };
  }
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol =
    (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto?.split(",")[0])?.trim() ||
    req.protocol;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const hostname = Array.isArray(host) ? host[0] : host;
  const secure = protocol === "https";
  return { origin: `${secure ? "https" : "http"}://${hostname}`, secure };
}

export function registerOAuthRoutes(app: Express) {
  // Safe sign-in / registration entry point
  app.get("/api/oauth/start", (req: Request, res: Response) => {
    const action = getQueryParam(req, "type") === "signUp" ? "signUp" : "signIn";
    if (!ENV.appId || !ENV.oAuthServerUrl) {
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

  // Direct decision endpoint from one-click email links
  app.get("/api/actions/decide", async (req: Request, res: Response) => {
    const token = getQueryParam(req, "token");
    if (!token) {
      res.status(400).send("Jeton d'action manquant.");
      return;
    }

    try {
      const record = await db.consumeActionToken(token);
      if (!record) {
        res.status(410).send(`
          <!DOCTYPE html>
          <html lang="fr">
          <head><meta charset="utf-8"><title>Lien expiré ou déjà utilisé</title>
          <style>body{font-family:sans-serif;padding:40px;text-align:center;background:#f8fafc;color:#1e293b;}</style></head>
          <body>
            <h2>Ce lien d'action a déjà été utilisé ou a expiré.</h2>
            <p>Vérifiez le statut du compte directement sur le <a href="/admin">tableau de bord d'administration</a>.</p>
          </body></html>
        `);
        return;
      }

      if (record.actionType === "approve_user") {
        const user = await db.updateUserAccountStatus(record.targetId, "approved", null);
        res.send(`
          <!DOCTYPE html>
          <html lang="fr">
          <head><meta charset="utf-8"><title>Compte approuvé</title>
          <style>body{font-family:sans-serif;padding:40px;text-align:center;background:#f0fdf4;color:#166534;}</style></head>
          <body>
            <h1>✔ Compte approuvé avec succès</h1>
            <p>Le compte de <strong>${user?.name || user?.email || "l'utilisateur #" + record.targetId}</strong> est désormais validé pour utiliser la plateforme ICX.</p>
            <p><a href="/admin" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#15803d;color:#fff;text-decoration:none;border-radius:6px;">Accéder au tableau de bord</a></p>
          </body></html>
        `);
        return;
      }

      if (record.actionType === "reject_user") {
        const user = await db.updateUserAccountStatus(record.targetId, "rejected", null);
        res.send(`
          <!DOCTYPE html>
          <html lang="fr">
          <head><meta charset="utf-8"><title>Compte refusé</title>
          <style>body{font-family:sans-serif;padding:40px;text-align:center;background:#fef2f2;color:#991b1b;}</style></head>
          <body>
            <h1>✖ Compte refusé</h1>
            <p>Le compte de <strong>${user?.name || user?.email || "l'utilisateur #" + record.targetId}</strong> a été marqué comme refusé.</p>
            <p><a href="/admin" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#b91c1c;color:#fff;text-decoration:none;border-radius:6px;">Accéder au tableau de bord</a></p>
          </body></html>
        `);
        return;
      }

      res.status(400).send("Type d'action non supporté.");
    } catch (err) {
      console.error("[Action Link] Decision failed:", err);
      res.status(500).send("Une erreur est survenue lors du traitement.");
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    const { nonce } = decodeOAuthState(state);
    const parsedCookies = parseCookieHeader(req.headers.cookie ?? "");
    const expectedNonce =
      parsedCookies[OAUTH_STATE_COOKIE] ?? parsedCookies[OAUTH_STATE_FALLBACK_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    res.clearCookie(OAUTH_STATE_FALLBACK_COOKIE, { path: "/", secure: false, sameSite: "lax" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      const { user, isNew } = await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Si c'est un nouveau compte créé, déclencher immédiatement la notification email avec liens d'approbation
      if (isNew) {
        try {
          const { origin } = getRequestOrigin(req);
          const approveToken = await db.createActionToken("approve_user", user.id);
          const rejectToken = await db.createActionToken("reject_user", user.id);

          const approveUrl = `${origin}/api/actions/decide?token=${approveToken}`;
          const rejectUrl = `${origin}/api/actions/decide?token=${rejectToken}`;
          const adminDashboardUrl = `${origin}/admin`;

          const emailData = renderAccountCreatedEmail({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            loginMethod: user.loginMethod,
            createdAt: user.createdAt,
            approveUrl,
            rejectUrl,
            adminDashboardUrl,
          });

          await sendEmail({
            to: TARGET_ADMIN_EMAIL,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          });
          console.log(`[OAuth] Alerte de nouveau compte envoyée pour #${user.id}`);
        } catch (mailErr) {
          console.error("[OAuth] Erreur lors de l'envoi de l'alerte nouveau compte:", mailErr);
        }
      }

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
