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

  const { reportType, startDate, endDate } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Parse date range
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        }
      };
    }

    if (reportType === "attendance") {
      // Daily attendance report
      const attendanceReport = await db.attendanceRecord.findMany({
        where: dateFilter,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          office: true,
        },
        orderBy: { timestamp: "desc" },
      });

      res.status(200).json(attendanceReport);
    } else if (reportType === "leave") {
      // Leave request report
      const leaveReport = await db.leaveRequest.findMany({
        where: dateFilter,
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

      res.status(200).json(leaveReport);
    } else if (reportType === "mission") {
      // Mission request report
      const missionReport = await db.missionRequest.findMany({
        where: dateFilter,
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

      res.status(200).json(missionReport);
    } else if (reportType === "workplan") {
      // Work plan report
      const workPlanReport = await db.workPlan.findMany({
        where: dateFilter,
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

      res.status(200).json(workPlanReport);
    } else if (reportType === "daily") {
      // Daily summary report
      const dailyReport = {
        attendance: await db.attendanceRecord.count({ where: dateFilter }),
        leaveRequests: await db.leaveRequest.count({ where: dateFilter }),
        missionRequests: await db.missionRequest.count({ where: dateFilter }),
        workPlans: await db.workPlan.count({ where: dateFilter }),
      };

      res.status(200).json(dailyReport);
    } else {
      // Default: return all reports
      const allReports = {
        attendance: await db.attendanceRecord.count({ where: dateFilter }),
        leaveRequests: await db.leaveRequest.count({ where: dateFilter }),
        missionRequests: await db.missionRequest.count({ where: dateFilter }),
        workPlans: await db.workPlan.count({ where: dateFilter }),
        users: await db.user.count({ where: { isActive: true } }),
      };

      res.status(200).json(allReports);
    }
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}