import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.GRRAND_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("GRRAND_SECRET is not set. Round tokens cannot be signed.");
  }
  return "dev-only-secret-not-for-production";
}

const b64 = (buf: Buffer) => buf.toString("base64url");

export function sign<T extends object>(payload: T): string {
  const body = b64(Buffer.from(JSON.stringify(payload)));
  const mac = b64(createHmac("sha256", secret()).update(body).digest());
  return `${body}.${mac}`;
}

export function verify<T>(token: unknown): T | null {
  if (typeof token !== "string" || token.length > 4000) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest();
  let given: Buffer;
  try {
    given = Buffer.from(mac, "base64url");
  } catch {
    return null;
  }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
