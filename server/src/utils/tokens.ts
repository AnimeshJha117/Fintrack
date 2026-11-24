import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function SignAccessToken(UserId: string)
{
    return jwt.sign({ sub: UserId }, env.JWT_ACCESS_SECRET, { expiresIn: "15m"});
}

export function SignRefreshToken(UserId: string)
{
    return jwt.sign({ sub: UserId }, env.JWT_REFRESH_SECRET, { expiresIn: "7d"});
}

export function VerifyRefreshToken(token: string) 
{
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
}