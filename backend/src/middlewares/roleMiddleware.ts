import { Response, NextFunction } from "express";

import { AuthRequest } from "./authMiddleware";

export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          message: "Unauthorized",
        });
        return;
      }

      if (!roles.includes(userRole)) {
        res.status(403).json({
          message: "Forbidden: Access denied",
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        message: "Role authorization failed",
        error,
      });
    }
  };
};
