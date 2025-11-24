import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, authorizeRole } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { Role } from "@prisma/client";

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
    // Get all users
    try {
      const { role, isActive } = req.query;
      
      let whereClause: any = {};
      if (role) whereClause.role = role;
      if (isActive !== undefined) whereClause.isActive = isActive === 'true';
      
      const users = await db.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          position: true,
          department: true,
          isActive: true,
          createdAt: true,
          registeredAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(users);
    } catch (error) {
      console.error("Fetch users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Update user information (role, active status, etc.)
    const { id, role, isActive, position, department } = req.body;

    try {
      const updateData: any = {};
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (position !== undefined) updateData.position = position;
      if (department !== undefined) updateData.department = department;

      const updatedUser = await db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          position: true,
          department: true,
          isActive: true,
        },
      });

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    // Delete user (soft delete by deactivating)
    const { id } = req.query;

    try {
      await db.user.update({
        where: { id: id as string },
        data: { isActive: false },
      });

      res.status(200).json({
        message: "User deactivated successfully",
      });
    } catch (error) {
      console.error("Deactivate user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}