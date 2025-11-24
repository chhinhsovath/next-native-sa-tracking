import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { MissionStatus } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply authentication
  await new Promise((resolve, reject) => {
    authenticate(req, res, () => resolve(true));
  });

  if (req.method === "POST") {
    // Create a new mission request
    const { title, description, startDate, endDate } = req.body;
    const userId = (req as any).user.userId;

    // Validate input
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ 
        message: "Title, description, start date, and end date are required" 
      });
    }

    try {
      const missionRequest = await db.missionRequest.create({
        data: {
          userId,
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: MissionStatus.PENDING,
        },
      });

      res.status(201).json({
        message: "Mission request submitted successfully",
        missionRequest,
      });
    } catch (error) {
      console.error("Mission request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    // Get mission requests for the current user
    const userId = (req as any).user.userId;

    try {
      const missionRequests = await db.missionRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json(missionRequests);
    } catch (error) {
      console.error("Fetch mission requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Update a mission request
    const { id, title, description, startDate, endDate } = req.body;
    const userId = (req as any).user.userId;

    try {
      const missionRequest = await db.missionRequest.findFirst({
        where: { id, userId },
      });

      if (!missionRequest) {
        return res.status(404).json({ message: "Mission request not found" });
      }

      if (missionRequest.status !== MissionStatus.PENDING) {
        return res.status(400).json({ message: "Cannot modify an approved or processed request" });
      }

      const updatedMissionRequest = await db.missionRequest.update({
        where: { id },
        data: {
          title: title || missionRequest.title,
          description: description || missionRequest.description,
          startDate: startDate ? new Date(startDate) : missionRequest.startDate,
          endDate: endDate ? new Date(endDate) : missionRequest.endDate,
        },
      });

      res.status(200).json({
        message: "Mission request updated successfully",
        missionRequest: updatedMissionRequest,
      });
    } catch (error) {
      console.error("Update mission request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    // Delete a mission request (cancel)
    const { id } = req.query;
    const userId = (req as any).user.userId;

    try {
      const missionRequest = await db.missionRequest.findFirst({
        where: { id: id as string, userId },
      });

      if (!missionRequest) {
        return res.status(404).json({ message: "Mission request not found" });
      }

      if (missionRequest.status !== MissionStatus.PENDING) {
        return res.status(400).json({ message: "Cannot cancel a processed request" });
      }

      await db.missionRequest.delete({
        where: { id: id as string },
      });

      res.status(200).json({
        message: "Mission request cancelled successfully",
      });
    } catch (error) {
      console.error("Delete mission request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}