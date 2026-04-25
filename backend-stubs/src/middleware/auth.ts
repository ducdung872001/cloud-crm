import type { Request, Response, NextFunction } from "express";

/**
 * Mock auth — gắn req.mentorId từ:
 * 1. Header `x-mentor-id` (dev/test)
 * 2. Query param `?mentorId=...` (compatible với FE hiện tại)
 * 3. Fallback "MT-001" (single-mentor dev mode)
 *
 * Production: thay bằng JWT verify + lookup từ DB.
 */
export function attachMentor(req: Request, _res: Response, next: NextFunction) {
  const fromHeader = (req.headers["x-mentor-id"] as string) ?? "";
  const fromQuery = (req.query.mentorId as string) ?? "";
  req.mentorId = fromHeader || fromQuery || "MT-001";
  req.isAdmin = (req.headers["x-admin-token"] as string) === "REBORN_ADMIN_DEV_TOKEN";
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAdmin) return res.status(403).json({ error: "Admin token required" });
  next();
}

declare module "express-serve-static-core" {
  interface Request {
    mentorId: string;
    isAdmin: boolean;
  }
}
