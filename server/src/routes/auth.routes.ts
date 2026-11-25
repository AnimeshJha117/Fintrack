import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import { validate } from "../middleware/validate.js"
import { RegisterSchema, LoginSchema, RefreshSchema } from "../schemas/auth.schema.js";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import { RequireAuth } from "../middleware/requireauth.js";
import { AuthLimiter } from "../middleware/RateLimit.js";
import { SignAccessToken, SignRefreshToken, VerifyRefreshToken, HashToken, REFRESH_TTL_MS } from "../utils/tokens.js";

async function IssueTokens(UserId: string)
{
    const RefreshToken = SignRefreshToken(UserId);
    await RefreshTokenModel.create({
        user: UserId,
        tokenHash: HashToken(RefreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS)
    });

    return { AccessToken: SignAccessToken(UserId), RefreshToken };
}

export const AuthRouter = Router();

AuthRouter.post("/register", AuthLimiter, validate(RegisterSchema), async (req, res) => {
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

AuthRouter.post("/login", AuthLimiter, validate(LoginSchema), async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+passwordhash");
    const valid = user ? await bcrypt.compare(password, user.passwordhash) : false;
    if (!user || !valid) {
        res.status(401).json({ message: "Invalid email or password." });
        return;
    }

    const tokens = await IssueTokens(user.id);
    res.json({
        ...tokens,
        user: { id: user.id, name: user.name, email: user.email }
    });
});

AuthRouter.post("/refresh", AuthLimiter, validate(RefreshSchema), async (req, res) => {
    const { RefreshToken } = req.body;

    let UserId: string;
    try 
    {
        UserId = VerifyRefreshToken(RefreshToken).sub as string;
    } 
    catch 
    {
        res.status(401).json({ message: "Invalid or expired session" });
        return;
    }

    const stored = await RefreshTokenModel.findOneAndDelete({ tokenHash: HashToken(RefreshToken) });

    if (!stored) 
    {
        await RefreshTokenModel.deleteMany({ user: UserId });
        res.status(401).json({ message: "Invalid or expired session" });
        return;
    }

    const user = await UserModel.findById(UserId);
    if (!user) 
    {
        res.status(401).json({ message: "Invalid or expired session" });
        return;
    }

    res.json(await IssueTokens(user.id));
});

AuthRouter.post("/logout", validate(RefreshSchema), async (req, res) => {
    await RefreshTokenModel.deleteOne({ tokenHash: HashToken(req.body.RefreshToken) });
    res.status(204).send();
});

AuthRouter.get("/me", RequireAuth, async (req, res) => {
    const user = await UserModel.findById(req.UserId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json({ id: user.id, name: user.name, email: user.email });
});