import { VerifyAccessToken } from "../utils/tokens.js";
export function RequireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const payload = VerifyAccessToken(header.slice(7));
    req.UserId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
