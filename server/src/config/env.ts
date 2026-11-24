import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    CLIENT_URL: z.string().url(),
    MONGODB_URI: z.string().startsWith("mongodb"),
});

export const env = EnvSchema.parse(process.env);