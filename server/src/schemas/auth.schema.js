import { z } from "zod";
export const RegisterSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});
export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});
export const RefreshSchema = z.object({
  RefreshToken: z.string().min(1),
});
