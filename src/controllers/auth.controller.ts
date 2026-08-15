import { Request, Response } from "express";
import { loginSchema } from "../validators/auth.validator";
import * as authService from "../services/auth.service";

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