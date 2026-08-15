import { UserRole, UserStatus } from "../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        instituteId: string | null;
      };
    }
  }
}

export {};