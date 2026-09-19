import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

const scrypt = (password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number }) => new Promise<Buffer>((resolve, reject) => {
  scryptCallback(password, salt, keylen, options, (error, derivedKey) => {
    if (error) reject(error);
    else resolve(derivedKey as Buffer);
  });
});
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();
const challenges = new Map<string, { answer: string; ip: string; expiresAt: number }>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
const SUPER_ADMIN_EMAIL = "icxps.sale@outlook.com";
function isSuperAdminEmail(email: string) {
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL;
}
function clientIp(req: Request) {
  return String(req.ip || req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim().slice(0, 100);
}
function rateKey(req: Request, email: string) {
  return `${clientIp(req)}:${normalizeEmail(email)}`;
}
function checkRateLimit(req: Request, email: string) {
  const key = rateKey(req, email);
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return;
  }
  if (current.count >= MAX_ATTEMPTS) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Trop de tentatives. Réessayez dans quelques minutes." });
  current.count += 1;
}
function clearRateLimit(req: Request, email: string) {
  attempts.delete(rateKey(req, email));
}
function hashOpenId(email: string) {
  return `icx_${createHash("sha256").update(normalizeEmail(email)).digest("hex").slice(0, 56)}`;
}
async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 })) as Buffer;
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}
async function verifyPassword(password: string, stored: string) {
  const [algorithm, n, r, p, saltText, hashText] = stored.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, "base64url");
  const actual = (await scrypt(password, Buffer.from(saltText, "base64url"), expected.length, { N: Number(n), r: Number(r), p: Number(p) })) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function issueHumanChallenge(req: Request) {
  challenges.forEach((item, id) => { if (item.expiresAt <= Date.now()) challenges.delete(id); });
  const left = 2 + Math.floor(Math.random() * 8);
  const right = 2 + Math.floor(Math.random() * 8);
  const id = randomUUID();
  challenges.set(id, { answer: String(left + right), ip: clientIp(req), expiresAt: Date.now() + CHALLENGE_TTL_MS });
  return { id, question: `Combien font ${left} + ${right} ?` };
}
function consumeHumanChallenge(req: Request, id: string, answer: string) {
  const challenge = challenges.get(id);
  challenges.delete(id);
  if (!challenge || challenge.expiresAt < Date.now() || challenge.ip !== clientIp(req) || answer.trim() !== challenge.answer) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "La vérification anti-robot est incorrecte ou expirée." });
  }
}
export async function registerLocalUser(req: Request, emailInput: string, password: string, name: string, challengeId: string, challengeAnswer: string) {
  const email = normalizeEmail(emailInput);
  checkRateLimit(req, email);
  consumeHumanChallenge(req, challengeId, challengeAnswer);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "La base de données n’est pas configurée." });
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) throw new TRPCError({ code: "CONFLICT", message: "Cette adresse e-mail est déjà utilisée." });
  const passwordHash = await hashPassword(password);
  const openId = hashOpenId(email);
  const result = await db.insert(users).values({ openId, name: name.trim(), email, passwordHash, loginMethod: "icx-email", role: isSuperAdminEmail(email) ? "super_admin" : "user", accountStatus: "approved" }).returning({ id: users.id, openId: users.openId, name: users.name, email: users.email, role: users.role, accountStatus: users.accountStatus });
  clearRateLimit(req, email);
  return result[0];
}
export async function authenticateLocalUser(req: Request, emailInput: string, password: string, challengeId: string, challengeAnswer: string) {
  const email = normalizeEmail(emailInput);
  checkRateLimit(req, email);
  consumeHumanChallenge(req, challengeId, challengeAnswer);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "La base de données n’est pas configurée." });
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = result[0];
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Adresse e-mail ou mot de passe incorrect." });
  }
  clearRateLimit(req, email);
  if (isSuperAdminEmail(email) && (user.role !== "super_admin" || user.accountStatus !== "approved")) {
    await db.update(users).set({ role: "super_admin", accountStatus: "approved" }).where(eq(users.id, user.id));
    return { ...user, role: "super_admin" as const, accountStatus: "approved" as const };
  }
  return user;
}
export { hashOpenId };
