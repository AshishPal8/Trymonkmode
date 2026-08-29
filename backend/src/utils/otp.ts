import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateOtp(): string {
  const buffer = crypto.randomBytes(4);
  const randomNumber = buffer.readUInt32BE(0) % 1000000;
  return randomNumber.toString().padStart(6, "0");
}

export async function hashOtp(otp: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

export async function verifyOtpHash(
  otp: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}
