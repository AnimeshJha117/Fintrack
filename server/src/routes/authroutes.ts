import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import { validate } from "../middleware/validate.js"
import { RegisterSchema } from "../schemas/authschema.js";

export const AuthRouter = Router();

AuthRouter.post("/register", validate(RegisterSchema), async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await UserModel.findOne({ email });
    if (existing)
    {
        res.status(409).json({ message: "Email already registered" });
        return;
    }

    const passwordhash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, passwordhash});

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
});