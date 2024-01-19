import type { NextApiRequest, NextApiResponse } from "next";

// Heartbeat API - Returns a 200 status code to confirm the site is up and running, regardless of auth and db status
export default async (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({ status: "ok" })
}
