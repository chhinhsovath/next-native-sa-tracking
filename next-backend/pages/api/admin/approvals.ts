import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, authorizeRole } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { Role, LeaveStatus, MissionStatus } from "@prisma/client";

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

  const { resource } = req.query;

  if (req.method === "GET") {
    // Get pending requests based on resource type
    try {
      if (resource === "user") {
        // Get pending user registrations
        const pendingUsers = await db.user.findMany({
          where: {
            isActive: false,
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
      } else if (resource === "leave") {
        // Get pending leave requests
        const pendingLeaveRequests = await db.leaveRequest.findMany({
          where: {
            status: LeaveStatus.PENDING,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
        });
        
        res.status(200).json(pendingLeaveRequests);
      } else if (resource === "mission") {
        // Get pending mission requests
        const pendingMissionRequests = await db.missionRequest.findMany({
          where: {
            status: MissionStatus.PENDING,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
        });
        
        res.status(200).json(pendingMissionRequests);
      } else {
        res.status(400).json({ message: "Invalid resource type. Use 'user', 'leave', or 'mission'" });
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    // Approve or reject requests based on resource type
    const { id, status, approvedBy } = req.body;
    const adminId = (req as any).user.userId;
    
    if (!id || !status) {
      return res.status(400).json({ message: "ID and status are required" });
    }
    
    try {
      if (resource === "user") {
        // Approve user registration
        const updatedUser = await db.user.update({
          where: { id },
          data: {
            isActive: true,
            role: status as Role || Role.STAFF,
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
      } else if (resource === "leave") {
        // Approve or reject leave request
        const leaveRequest = await db.leaveRequest.update({
          where: { id },
          data: {
            status: status as LeaveStatus,
            approvedBy: adminId,
            approvedAt: new Date(),
          },
        });
        
        res.status(200).json({
          message: `Leave request ${status.toLowerCase()} successfully`,
          leaveRequest,
        });
      } else if (resource === "mission") {
        // Approve or reject mission request
        const missionRequest = await db.missionRequest.update({
          where: { id },
          data: {
            status: status as MissionStatus,
            approvedBy: adminId,
            approvedAt: new Date(),
          },
        });
        
        res.status(200).json({
          message: `Mission request ${status.toLowerCase()} successfully`,
          missionRequest,
        });
      } else {
        res.status(400).json({ message: "Invalid resource type. Use 'user', 'leave', or 'mission'" });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}