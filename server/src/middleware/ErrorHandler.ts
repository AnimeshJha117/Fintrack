import type { Request, Response, NextFunction } from "express";

export function NotFound(_req: Request, res: Response)
{
    res.status(404).json({ message: "Route not found" });
}

export function ErrorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction)
{
    const e = err as { status?: number; code?: number; message?: string };
    if (e.code === 11000)
    {
        res.status(409).json({ message: "Duplicate value" });
        return;
    }

    if (e.status && e.status >= 400 && e.status < 500) 
    {
        res.status(e.status).json({ message: e.message ?? "Bad request" });
        return;
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
}