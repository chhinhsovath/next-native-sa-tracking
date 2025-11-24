import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate, authorizeRole } from "../../../src/lib/authMiddleware";
import db from "../../../src/lib/db";
import { Role } from "../../../src/generated/prisma/enums";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Public endpoint to get active office locations
    try {
      const offices = await db.officeLocation.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true,
          radius: true,
          createdAt: true,
        },
      });

      res.status(200).json(offices);
    } catch (error) {
      console.error("Fetch offices error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    // Apply authentication and authorization for other methods
    await new Promise((resolve, reject) => {
      authenticate(req, res, () => resolve(true));
    });
    
    await new Promise((resolve, reject) => {
      authorizeRole(Role.ADMIN)(req as any, res, () => resolve(true));
    });

    if (req.method === "POST") {
      // Create a new office location (Admin only)
      const { name, latitude, longitude, radius } = req.body;

      // Validate input
      if (!name || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ 
          message: "Name, latitude, and longitude are required" 
        });
      }

      try {
        const office = await db.officeLocation.create({
          data: {
            name,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radius: radius ? parseFloat(radius) : 50, // Default to 50 meters
            isActive: true,
          },
        });

        res.status(201).json({
          message: "Office location created successfully",
          office,
        });
      } catch (error) {
        console.error("Create office error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    } else if (req.method === "PUT") {
      // Update an office location (Admin only)
      const { id, name, latitude, longitude, radius, isActive } = req.body;

      try {
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
        if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
        if (radius !== undefined) updateData.radius = parseFloat(radius);
        if (isActive !== undefined) updateData.isActive = isActive;

        const office = await db.officeLocation.update({
          where: { id },
          data: updateData,
        });

        res.status(200).json({
          message: "Office location updated successfully",
          office,
        });
      } catch (error) {
        console.error("Update office error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    } else if (req.method === "DELETE") {
      // Delete an office location (Admin only)
      const { id } = req.query;

      try {
        await db.officeLocation.delete({
          where: { id: id as string },
        });

        res.status(200).json({
          message: "Office location deleted successfully",
        });
      } catch (error) {
        console.error("Delete office error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
}