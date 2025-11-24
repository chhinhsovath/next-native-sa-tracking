import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { AttendanceType } from "@prisma/client";
import { findClosestLocation } from "../../../src/lib/geofencing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply authentication
  await new Promise((resolve, reject) => {
    authenticate(req, res, () => resolve(true));
  });

  if (req.method === "POST") {
    const { attendanceType, latitude, longitude } = req.body;
    const userId = (req as any).user.userId;

    // Validate input
    if (!attendanceType || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Attendance type and coordinates are required" });
    }

    try {
      // Get the closest office location
      const offices = await db.officeLocation.findMany({
        where: { isActive: true }
      });

      if (offices.length === 0) {
        return res.status(400).json({ message: "No office locations configured" });
      }

      // Find the closest office using the geofencing utility
      const closestLocation = findClosestLocation(
        latitude,
        longitude,
        offices.map(office => ({
          id: office.id,
          latitude: office.latitude,
          longitude: office.longitude,
          radius: office.radius
        }))
      );

      if (!closestLocation) {
        return res.status(400).json({ message: "Unable to determine closest office location" });
      }

      // Get the office details
      const closestOffice = offices.find(office => office.id === closestLocation.id);
      
      // Check if user is within geofence
      let status = closestLocation.withinGeofence ? "Validated" : "Outside Geofence";

      // Create attendance record
      const attendanceRecord = await db.attendanceRecord.create({
        data: {
          userId,
          officeId: closestOffice!.id,
          attendanceType: attendanceType as AttendanceType,
          latitude,
          longitude,
          status,
        },
      });

      res.status(201).json({
        message: "Attendance recorded successfully",
        attendance: {
          ...attendanceRecord,
          withinGeofence: closestLocation.withinGeofence,
          distanceFromOffice: closestLocation.distance
        }
      });
    } catch (error) {
      console.error("Attendance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    // Get attendance records for the current user
    const userId = (req as any).user.userId;
    const { date } = req.query;

    try {
      let whereClause: any = { userId };

      if (date) {
        // Filter by date if provided
        const startDate = new Date(date as string);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date as string);
        endDate.setHours(23, 59, 59, 999);

        whereClause.timestamp = {
          gte: startDate,
          lte: endDate,
        };
      }

      const attendanceRecords = await db.attendanceRecord.findMany({
        where: whereClause,
        include: {
          office: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

      res.status(200).json(attendanceRecords);
    } catch (error) {
      console.error("Fetch attendance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}