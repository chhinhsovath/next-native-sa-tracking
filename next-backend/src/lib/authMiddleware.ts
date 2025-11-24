import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "./auth";
import { Role } from "@prisma/client";
import db from "./db";

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
    role: Role;
  };
}

// Middleware to authenticate user
export const authenticate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user info to request
    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

// Middleware to check user role
export const authorizeRole = (requiredRole: Role | Role[]) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({ error: "Access denied. No user information." });
    }

    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(req.user.role)
      : req.user.role === requiredRole;

    if (!hasRequiredRole) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }

    next();
  };
};

// Function to check if user is admin
export const isAdmin = (req: AuthenticatedRequest) => {
  return req.user?.role === Role.ADMIN;
};

// Function to check if user is staff
export const isStaff = (req: AuthenticatedRequest) => {
  return req.user?.role === Role.STAFF;
};