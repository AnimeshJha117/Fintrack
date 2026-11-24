import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CLIENT_URL: z.string().url(),
    MONGODB_URI: z.string().startsWith("mongodb"),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
});

export const env = EnvSchema.parse(process.env);