import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, authorizeRole } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { Role } from "../../../src/generated/prisma/enums";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply authentication and authorization
  await new Promise((resolve, reject) => {
    authenticate(req, res, () => resolve(true));
  });
  
  await new Promise((resolve, reject) => {
    authorizeRole(Role.ADMIN)(req as any, res, () => resolve(true));
  });

  if (req.method === "GET") {
    // Get pending user registrations
    try {
      const pendingUsers = await db.user.findMany({
        where: {
          isActive: false, // Assuming unapproved users are not active
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          position: true,
          department: true,
          role: true,
          registeredAt: true,
        },
      });
      
      res.status(200).json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Approve a user registration
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    try {
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          isActive: true,
          role: role || Role.STAFF, // Default to staff if no role specified
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });
      
      res.status(200).json({
        message: "User approved successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}