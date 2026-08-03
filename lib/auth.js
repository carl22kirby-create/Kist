import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Format stored in PASSWORD_HASH env var: "<salt-hex>:<hash-hex>"
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  const hashBuffer = Buffer.from(hashHex, "hex");
  const candidate = scryptSync(password, salt, 64);
  if (candidate.length !== hashBuffer.length) return false;
  return timingSafeEqual(candidate, hashBuffer);
}

export function generateToken() {
  return randomBytes(32).toString("hex");
}
