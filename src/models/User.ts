// src/models/User.ts
import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        businessName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["garage", "SA"],
            default: "garage",
        },
        status: {
            type: String,
            enum: ["active", "delete"],
            default: "active",
        },
        otp: { type: String },
    },
    { timestamps: true }
);

const User = model("User", userSchema);

export default User;
