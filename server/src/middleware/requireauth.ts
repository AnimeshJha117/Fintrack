import type { Request, Response, NextFunction } from "express";
import { VerifyAccessToken } from "../utils/tokens.js";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function RequireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }

    try {
        const payload = VerifyAccessToken(header.slice(7));
        req.userId = payload.sub as string;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
}