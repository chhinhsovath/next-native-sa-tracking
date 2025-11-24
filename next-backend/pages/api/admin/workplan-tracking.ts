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

  const { userId, status } = req.query;

  if (req.method === "GET") {
    try {
      let whereClause: any = {};
      
      if (userId) {
        whereClause.userId = userId as string;
      }
      
      if (status) {
        whereClause.status = status;
      }

      const workPlans = await db.workPlan.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(workPlans);
    } catch (error) {
      console.error("Fetch work plans error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Admin can update work plan status or add comments
    const { id, status, comments } = req.body;
    const adminId = (req as any).user.userId;

    try {
      const workPlan = await db.workPlan.findUnique({
        where: { id },
      });

      if (!workPlan) {
        return res.status(404).json({ message: "Work plan not found" });
      }

      // Prepare update data
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (comments !== undefined) {
        // Append admin comments to existing comments
        const updatedComments = workPlan.comments 
          ? `${workPlan.comments}\nAdmin comment (${new Date().toLocaleDateString()}): ${comments}`
          : `Admin comment (${new Date().toLocaleDateString()}): ${comments}`;
        updateData.comments = updatedComments;
      }

      const updatedWorkPlan = await db.workPlan.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
        },
      });

      res.status(200).json({
        message: "Work plan updated successfully",
        workPlan: updatedWorkPlan,
      });
    } catch (error) {
      console.error("Update work plan error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}