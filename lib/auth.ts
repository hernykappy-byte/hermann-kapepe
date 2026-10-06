import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { sign, verify } from "./token";

export const SESSION_COOKIE = "grrand_s";
export const SESSION_DAYS = 30;

export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const h = scryptSync(pin, salt, 32);
  return `s1$${salt.toString("hex")}$${h.toString("hex")}`;
}

export function checkPin(pin: string, stored: string | null): boolean {
  // Always do the same work so a missing user costs the same time as a wrong PIN.
  const [v, saltHex, hashHex] = (stored ?? "s1$" + "00".repeat(16) + "$" + "00".repeat(32)).split("$");
  const expected = Buffer.from(hashHex ?? "", "hex");
  const got = scryptSync(pin, Buffer.from(saltHex ?? "", "hex"), 32);
  return !!stored && v === "s1" && expected.length === got.length && timingSafeEqual(expected, got);
}

type Session = { u: string; exp: number };

export function makeSession(profileId: string, now = Date.now()): string {
  return sign<Session>({ u: profileId, exp: now + SESSION_DAYS * 86400_000 });
}

export function readSession(token: string | undefined, now = Date.now()): string | null {
  const s = verify<Session>(token);
  return s && typeof s.u === "string" && typeof s.exp === "number" && s.exp > now ? s.u : null;
}
