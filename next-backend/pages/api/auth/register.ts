import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../src/lib/db";
import { hashPassword, generateToken } from "../../../src/lib/auth";
import { Role } from "../../../src/generated/prisma/enums";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, firstName, lastName, position, department } = req.body;

  // Validate input
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        position,
        department,
        role: Role.STAFF, // Default to staff role for registration
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user info and token (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}