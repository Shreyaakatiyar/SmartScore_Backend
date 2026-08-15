import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!refreshSecret) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

export interface AccessTokenPayload {
  sub: string;
  role: "STUDENT" | "TEACHER" | "INVIGILATOR" | "ADMIN";
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

export const generateAccessToken = (
  userId: string,
  role: AccessTokenPayload["role"]
): string => {
  return jwt.sign(
    {
      sub: userId,
      role,
    },
    accessSecret!,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    } as jwt.SignOptions
  );
};

export const generateRefreshToken = (
  userId: string
): { token: string; jti: string } => {
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    {
      sub: userId,
    },
    refreshSecret!,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
      jwtid: jti,
    } as jwt.SignOptions
  );

  return {
    token,
    jti,
  };
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  return jwt.verify(token, accessSecret!) as AccessTokenPayload;
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload => {
  return jwt.verify(token, refreshSecret!) as RefreshTokenPayload;
};