import argon2 from "argon2";

export const hashPassword = async (
  password: string
): Promise<string> => {
  return argon2.hash(password);
};

export const verifyPassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return argon2.verify(passwordHash, password);
};