import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/enums";

// Helper function to hash passwords
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to verify passwords
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (payload: {
  userId: string;
  email: string;
  role: Role;
}): string => {
  const secret = process.env.JWT_SECRET || "fallback_secret_key";
  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || "fallback_secret_key";
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// Check if user has required role
export const hasRole = (userRole: Role, requiredRole: Role | Role[]): boolean => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
};