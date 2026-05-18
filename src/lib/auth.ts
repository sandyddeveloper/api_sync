import crypto from "crypto";

// Secret key for HMAC token signing
const JWT_SECRET = process.env.JWT_SECRET || "nila-cosmic-secret-key-2026-eternal-love";

// Admin token for authenticating admin requests
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "nila-admin-secret-2026";

/**
 * Hash password using PBKDF2
 */
export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

/**
 * Verify password against stored hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const checkHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    
    // Use timingSafeEqual to protect against timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(checkHash, "hex")
    );
  } catch (error) {
    return false;
  }
}

/**
 * Generate a cryptographically signed session token (standards-compliant stateless JWT structure)
 */
export function generateToken(payload: object, expiresInDays: number = 7): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;
  
  const tokenPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify token signature and expiration
 */
export function verifyToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    // Decode and parse payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null; // Expired
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}
