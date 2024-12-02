// src/routes/userRoutes.ts
import express from "express";
import User from "../models/User";
import { decryptData } from "../utils/encryption";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/auth";
import { authenticateToken } from "../middleware/authMiddleware";
import { FilterQuery } from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, businessName, password } = req.body;
        const decryptedPassword = decryptData(password);
        const hashedPassword = await bcrypt.hash(decryptedPassword, 10);
        const user = new User({
            name,
            email,
            businessName,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ error: "Invalid email." });
        }
        const encryptedPassword = decryptData(password);
        const isMatch = await bcrypt.compare(encryptedPassword, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: "Invalid password." });
        }
        const token = generateToken(user._id, user.email, user.name, user.role);
        res.send({ user, token });
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: "User not found." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();

        user.otp = otp;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            html: `<p>Hello,${user.name}</p>
           <p>We received a request to reset your password. Your OTP code is <strong>${otp}</strong>.</p>
           <p>Please use this code to proceed with the password reset. If you did not request a password reset, please ignore this email.</p>
           <p>Thank you,<br>DbCodder</p>`,
        });

        res.status(200).send({ message: "OTP sent to your email." });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).send({
            error: "Failed to send OTP. Please try again.",
        });
    }
});

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp) {
            return res.status(400).send({ error: "Invalid OTP." });
        }
        if (user.otp !== otp) {
            return res.status(400).send({ error: "Incorrect OTP." });
        }
        user.otp = undefined;
        await user.save();
        res.status(200).send({ message: "OTP verified successfully." });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).send({
            error: "Failed to verify OTP. Please try again.",
        });
    }
});

router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ error: "User not found." });
        }

        const encryptedPassword = decryptData(newPassword);
        const hashedPassword = await bcrypt.hash(encryptedPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).send({
            message: "Password has been reset successfully.",
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send({
            error: "Failed to reset password. Please try again.",
        });
    }
});

router.post("/add", authenticateToken, async (req, res) => {
    try {
        const { id, name, businessName, email, password } = req.body;

        if (id) {
            // Update existing user
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { name, businessName, email, password },
                { new: true }
            );
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json(updatedUser);
        } else {
            // Add new user
            const newUser = new User({ name, businessName, email, password });
            await newUser.save();
            return res.status(201).json(newUser);
        }
    } catch (error) {
        console.error("Error in add/update user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/changepassword", authenticateToken, async (req, res) => {
    try {
        const { userId, currentPassword, password } = req.body;
        if (!userId || !currentPassword || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const decryptedCurrentPassword = decryptData(currentPassword);
        // Compare the current password
        const passwordsMatched = await bcrypt.compare(
            decryptedCurrentPassword,
            user.password
        );
        if (!passwordsMatched) {
            return res
                .status(400)
                .json({ error: "Current password is incorrect" });
        }
        // Hash the new password
        const decryptedPassword = decryptData(password);
        const hashedPassword = await bcrypt.hash(decryptedPassword, 10);
        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res
            .status(200)
            .json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error in changing password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/get", authenticateToken, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send(error);
    }
});

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { searchText } = req.body; // Extract searchText from the request body

        // Define the query as a flexible object
        let query: FilterQuery<any> = { status: "active" }; // Adjust this based on your schema

        // Add search conditions if searchText is provided
        if (searchText) {
            query = {
                $and: [
                    { status: "active" }, // Ensure only active users
                    {
                        $or: [
                            { name: { $regex: searchText, $options: "i" } },
                            {
                                businessName: {
                                    $regex: searchText,
                                    $options: "i",
                                },
                            },
                            { email: { $regex: searchText, $options: "i" } },
                        ],
                    },
                ],
            };
        }

        const users = await User.find(query);
        res.status(200).send(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send(error);
    }
});

router.post("/:id", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put("/deleteuser/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { status: "delete" },
            { new: true }
        );

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error("Error in deleting user:", error);
        res.status(400).send(error);
    }
});

export default router;
