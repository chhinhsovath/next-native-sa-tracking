import type { NextApiRequest, NextApiResponse } from "next";
import { authenticate } from "../../src/lib/authMiddleware";
import db from "../../src/lib/db";
import { hashPassword } from "../../src/lib/auth";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Apply authentication
    await new Promise((resolve) => {
        authenticate(req, res, () => resolve(true));
    });

    const userId = (req as any).user.userId;

    if (req.method === "GET") {
        // Get user profile
        try {
            const user = await db.user.findUnique({
                where: { id: userId },
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
                    updatedAt: true,
                },
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (req.method === "PUT") {
        // Update user profile
        const { firstName, lastName, position, department, password } = req.body;

        try {
            const updateData: any = {};

            if (firstName !== undefined) updateData.firstName = firstName;
            if (lastName !== undefined) updateData.lastName = lastName;
            if (position !== undefined) updateData.position = position;
            if (department !== undefined) updateData.department = department;

            // Only allow password update if provided
            if (password && password.length >= 6) {
                updateData.password = await hashPassword(password);
            }

            const updatedUser = await db.user.update({
                where: { id: userId },
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
                    updatedAt: true,
                },
            });

            res.status(200).json({
                message: "Profile updated successfully",
                user: updatedUser,
            });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else {
        return res.status(405).json({ message: "Method not allowed" });
    }
}
