import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.status(200).json({
    status: "OK",
    message: "TrackingApp Backend API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
}