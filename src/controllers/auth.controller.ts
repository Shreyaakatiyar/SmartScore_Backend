import { Request, Response } from "express";
import { loginSchema, registerSchema, refreshTokenSchema } from "../validators/auth.validator";
import * as authService from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: parsed.error.flatten(),
      });
    }

    const result = await authService.register(parsed.data);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Registration failed";

    if (message === "Email is already registered") {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    if (message === "Institute not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2003"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid instituteId: Institute does not exist",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: parsed.error.flatten(),
      });
    }

    const result = await authService.login(parsed.data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    if (
      message === "Invalid email or password"
    ) {
      return res.status(401).json({
        success: false,
        message,
      });
    }

    if (
      message === "Account is not active"
    ) {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentUser = (
  req: Request,
  res: Response
) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};

export const refresh = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = refreshTokenSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: parsed.error.flatten(),
      });
    }

    const result = await authService.refresh(
      parsed.data
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Token refresh failed";

    if (
      message === "Account is not active"
    ) {
      return res.status(403).json({
        success: false,
        message,
      });
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

export const logout = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed = refreshTokenSchema.safeParse(
      req.body
    );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
        errors: parsed.error.flatten(),
      });
    }

    await authService.logout(
      parsed.data.refreshToken
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};