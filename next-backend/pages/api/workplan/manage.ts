import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { WorkPlanStatus } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply authentication
  await new Promise((resolve, reject) => {
    authenticate(req, res, () => resolve(true));
  });

  if (req.method === "POST") {
    // Create a new work plan
    const { title, description, dueDate } = req.body;
    const userId = (req as any).user.userId;

    // Validate input
    if (!title || !description || !dueDate) {
      return res.status(400).json({ 
        message: "Title, description, and due date are required" 
      });
    }

    try {
      const workPlan = await db.workPlan.create({
        data: {
          userId,
          title,
          description,
          dueDate: new Date(dueDate),
          status: WorkPlanStatus.DRAFT,
        },
      });

      res.status(201).json({
        message: "Work plan created successfully",
        workPlan,
      });
    } catch (error) {
      console.error("Work plan error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    // Get work plans for the current user
    const userId = (req as any).user.userId;
    const { status } = req.query;

    try {
      let whereClause: any = { userId };
      
      if (status) {
        whereClause.status = status;
      }

      const workPlans = await db.workPlan.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(workPlans);
    } catch (error) {
      console.error("Fetch work plans error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Update a work plan
    const { id, title, description, dueDate, status, progress, achievement, output, comments } = req.body;
    const userId = (req as any).user.userId;

    try {
      const workPlan = await db.workPlan.findFirst({
        where: { id, userId },
      });

      if (!workPlan) {
        return res.status(404).json({ message: "Work plan not found" });
      }

      // Prepare update data
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
      if (status !== undefined) updateData.status = status;
      if (progress !== undefined) updateData.progress = progress;
      if (achievement !== undefined) updateData.achievement = achievement;
      if (output !== undefined) updateData.output = output;
      if (comments !== undefined) updateData.comments = comments;
      
      // If changing status to submitted, update submittedAt
      if (status === WorkPlanStatus.SUBMITTED && workPlan.status !== WorkPlanStatus.SUBMITTED) {
        updateData.submittedAt = new Date();
      }

      const updatedWorkPlan = await db.workPlan.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        message: "Work plan updated successfully",
        workPlan: updatedWorkPlan,
      });
    } catch (error) {
      console.error("Update work plan error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    // Delete a work plan
    const { id } = req.query;
    const userId = (req as any).user.userId;

    try {
      const workPlan = await db.workPlan.findFirst({
        where: { id: id as string, userId },
      });

      if (!workPlan) {
        return res.status(404).json({ message: "Work plan not found" });
      }

      if (workPlan.status === WorkPlanStatus.SUBMITTED || workPlan.status === WorkPlanStatus.COMPLETED) {
        return res.status(400).json({ message: "Cannot delete a submitted or completed work plan" });
      }

      await db.workPlan.delete({
        where: { id: id as string },
      });

      res.status(200).json({
        message: "Work plan deleted successfully",
      });
    } catch (error) {
      console.error("Delete work plan error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}