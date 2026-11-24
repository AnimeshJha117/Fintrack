import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import { validate } from "../middleware/validate.js"
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema.js";
import { env } from "../config/env.js";
import { RequireAuth } from "../middleware/requireauth.js";
import { SignAccessToken, SignRefreshToken, VerifyRefreshToken } from "../utils/tokens.js";

const REFRESH_COOKIE = "RefreshToken";
const RefreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const AuthRouter = Router();

AuthRouter.post("/register", validate(RegisterSchema), async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await UserModel.findOne({ email });
    if (existing) {
        res.status(409).json({ message: "Email already registered" });
        return;
    }

    const passwordhash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordhash });

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

AuthRouter.post("/login", validate(LoginSchema), async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+passwordhash");
    const valid = user ? await bcrypt.compare(password, user.passwordhash) : false;
    if (!user || !valid) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
    }

    res.cookie(REFRESH_COOKIE, SignRefreshToken(user.id), RefreshCookieOptions);
    res.json({
        accessToken: SignAccessToken(user.id),
        user: { id: user.id, name: user.name, email: user.email },
    });
});

AuthRouter.post("/refresh", async (req, res) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) {
        res.status(401).json({ message: "Not authenticated" });
        return;
    }

    try {
        const payload = VerifyRefreshToken(token);
        const user = await UserModel.findById(payload.sub);
        if (!user) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        res.json({ accessToken: SignAccessToken(user.id) });
    }
    catch {
        res.status(401).json({ message: "Invalid or expired session" });
    }
});

AuthRouter.post("/logout", (_req, res) => {
    res.clearCookie(REFRESH_COOKIE, { path: RefreshCookieOptions.path });
    res.status(204).send();
});

AuthRouter.get("/me", RequireAuth, async (req, res) => {
    const user = await UserModel.findById(req.userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ id: user.id, name: user.name, email: user.email });
});