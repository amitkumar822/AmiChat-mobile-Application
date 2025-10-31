import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, avatar } = req.body;

  try {
    if (!email || !password || !name) {
      res
        .status(400)
        .json({
          success: false,
          message: "Email, password and name are required",
        });
      return;
    }
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      avatar: avatar || "",
    });

    const token = generateToken(newUser);
    res
      .status(201)
      .json({ success: true, message: "User created successfully", token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const token = generateToken(user);
    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
