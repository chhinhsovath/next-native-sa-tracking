import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { LeaveStatus } from "../../../src/generated/prisma/enums";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply authentication
  await new Promise((resolve, reject) => {
    authenticate(req, res, () => resolve(true));
  });

  if (req.method === "POST") {
    // Create a new leave request
    const { startDate, endDate, reason } = req.body;
    const userId = (req as any).user.userId;

    // Validate input
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "Start date, end date, and reason are required" });
    }

    try {
      const leaveRequest = await db.leaveRequest.create({
        data: {
          userId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason,
          status: LeaveStatus.PENDING,
        },
      });

      res.status(201).json({
        message: "Leave request submitted successfully",
        leaveRequest,
      });
    } catch (error) {
      console.error("Leave request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    // Get leave requests for the current user
    const userId = (req as any).user.userId;

    try {
      const leaveRequests = await db.leaveRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(leaveRequests);
    } catch (error) {
      console.error("Fetch leave requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Update a leave request (for cancellation)
    const { id, reason } = req.body;
    const userId = (req as any).user.userId;

    try {
      const leaveRequest = await db.leaveRequest.findFirst({
        where: { id, userId },
      });

      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leaveRequest.status !== LeaveStatus.PENDING) {
        return res.status(400).json({ message: "Cannot modify a processed request" });
      }

      const updatedLeaveRequest = await db.leaveRequest.update({
        where: { id },
        data: {
          reason: reason || leaveRequest.reason, // Only update reason if provided
        },
      });

      res.status(200).json({
        message: "Leave request updated successfully",
        leaveRequest: updatedLeaveRequest,
      });
    } catch (error) {
      console.error("Update leave request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    // Delete a leave request (cancel)
    const { id } = req.query;
    const userId = (req as any).user.userId;

    try {
      const leaveRequest = await db.leaveRequest.findFirst({
        where: { id: id as string, userId },
      });

      if (!leaveRequest) {
        return res.status(404).json({ message: "Leave request not found" });
      }

      if (leaveRequest.status !== LeaveStatus.PENDING) {
        return res.status(400).json({ message: "Cannot cancel a processed request" });
      }

      await db.leaveRequest.delete({
        where: { id: id as string },
      });

      res.status(200).json({
        message: "Leave request cancelled successfully",
      });
    } catch (error) {
      console.error("Delete leave request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}