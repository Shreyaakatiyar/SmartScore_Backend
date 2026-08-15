import { prisma } from "../lib/prisma";
import {
  verifyPassword,
} from "./password.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./token.service";
import type { LoginInput, RefreshTokenInput, } from "../validators/auth.validator";
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

export const refresh = async (
  input: RefreshTokenInput
) => {
  let payload;

  try {
    payload = verifyRefreshToken(input.refreshToken);
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const refreshTokenRecord =
    await prisma.refreshToken.findUnique({
      where: {
        jti: payload.jti,
      },
    });

  if (!refreshTokenRecord) {
    throw new Error("Invalid refresh token");
  }

  if (refreshTokenRecord.revokedAt) {
    throw new Error("Refresh token has been revoked");
  }

  if (refreshTokenRecord.expiresAt < new Date()) {
    throw new Error("Refresh token has expired");
  }

  const tokenMatches = await verifyPassword(
    input.refreshToken,
    refreshTokenRecord.tokenHash
  );

  if (!tokenMatches) {
    throw new Error("Invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      instituteId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("Account is not active");
  }

  // Revoke the old refresh token
  await prisma.refreshToken.update({
    where: {
      id: refreshTokenRecord.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // Generate a new token pair
  const accessToken = generateAccessToken(
    user.id,
    user.role
  );

  const newRefreshToken = generateRefreshToken(
    user.id
  );

  const newRefreshTokenHash = await hashPassword(
    newRefreshToken.token
  );

  await prisma.refreshToken.create({
    data: {
      jti: newRefreshToken.jti,
      tokenHash: newRefreshTokenHash,
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken.token,
  };
};

export const logout = async (
  refreshToken: string
) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    
    return;
  }

  const tokenRecord =
    await prisma.refreshToken.findUnique({
      where: {
        jti: payload.jti,
      },
    });

  if (!tokenRecord) {
    return;
  }

  if (tokenRecord.revokedAt) {
    return;
  }

  await prisma.refreshToken.update({
    where: {
      id: tokenRecord.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};