import crypto from "node:crypto";

const SECRET_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012";
const ALGORITHM = "aes-256-cbc";

export function encryptPassword(text: string) {
    const uniquePrefix = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), uniquePrefix);
    let encryptedText = cipher.update(text);
    encryptedText = Buffer.concat([encryptedText, cipher.final()]);
    return `${uniquePrefix.toString("hex")}:${encryptedText.toString("hex")}`;
}