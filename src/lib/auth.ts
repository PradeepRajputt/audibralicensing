
import bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcrypt.
 * @param password The plain-text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

/**
 * Verifies a plain-text password against a bcrypt hash.
 * @param password The plain-text password to verify.
 * @param hash The stored password hash.
 * @returns A promise that resolves to true if the password is valid, otherwise false.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hash);
  return isValid;
}
