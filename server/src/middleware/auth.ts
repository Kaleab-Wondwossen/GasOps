import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as any;
    (req as any).user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(minRole: "staff" | "admin") {
  const order = ["staff", "admin"];
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (order.indexOf(user.role) < order.indexOf(minRole)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
