import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success)
    {
        res.status(400).json({
            message: "Validation failed.",
            errors: result.error.flatten().fieldErrors,
        });
        return;
    }

    req.body = result.data;
    next();
};