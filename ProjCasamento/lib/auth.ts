import { randomBytes } from "crypto";

export function generateGuestToken(): string {
  return randomBytes(16).toString("hex");
}
