import { prisma } from "../lib/prisma";
import {
  verifyPassword,
} from "./password.service";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./token.service";
import type { LoginInput } from "../validators/auth.validator";
import { hashPassword } from "./password.service";

export const login = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Account is not active");
  }

  const isPasswordValid = await verifyPassword(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  const refreshTokenResult = generateRefreshToken(user.id);

  const refreshTokenHash = await hashPassword(
    refreshTokenResult.token
  );

  await prisma.refreshToken.create({
    data: {
      jti: refreshTokenResult.jti,
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
});

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      instituteId: user.instituteId,
    },
    accessToken,
    refreshToken: refreshTokenResult.token,
  };
};