import jwt from "jsonwebtoken";
import { createHash, randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export function SignAccessToken(UserId: string)
{
  return jwt.sign({ sub: UserId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m", algorithm: "HS256" });
}

export function SignRefreshToken(UserId: string)
{
  return jwt.sign({ sub: UserId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d", algorithm: "HS256", jwtid: randomUUID() });
}

export function VerifyRefreshToken(token: string) 
{
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
}

export function VerifyAccessToken(token: string) 
{
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
}

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function HashToken(token: string) 
{
  return createHash("sha256").update(token).digest("hex");
}