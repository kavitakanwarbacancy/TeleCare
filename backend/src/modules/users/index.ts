import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware";
import * as usersService from "./users.service";

const router = Router();

/**
 * GET /users/me
 * Current user profile with linked doctor or patient profile.
 */
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.sub;
      const result = await usersService.getMe(userId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

export { router as usersRouter };