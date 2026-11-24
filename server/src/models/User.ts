import { Schema, model } from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordhash: { type: String, required: true, select: false },
    },
    { timestamps: true },
);

export const UserModel = model("User", UserSchema);