import { createCipheriv, createDecipheriv, createHash } from "crypto"

const SECRET = process.env.BETTER_AUTH_SECRET

const KEY = createHash("sha256").update(SECRET!).digest()
const IV = Buffer.alloc(16, 0)

export function encrypt(value: string): string {
  const cipher = createCipheriv("aes-256-cbc", KEY, IV)

  let encrypted = cipher.update(value, "utf8", "base64")
  encrypted += cipher.final("base64")

  return encrypted
}

export function decrypt(encryptedValue: string): string {
  const decipher = createDecipheriv("aes-256-cbc", KEY, IV)

  let decrypted = decipher.update(encryptedValue, "base64", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
