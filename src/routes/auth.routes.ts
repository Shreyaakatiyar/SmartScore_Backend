import { Router } from "express";
import {
  login,
  getCurrentUser,
  refresh,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

router.post("/refresh", refresh);

export default router;