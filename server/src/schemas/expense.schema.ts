import { z } from "zod";

export const CreateExpenseSchema = z.object({
    amount: z.number().int().positive(),
    category: z.string().trim().min(1).max(50),
    description: z.string().trim().max(200).optional(),
    date: z.coerce.date().optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial().refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
});