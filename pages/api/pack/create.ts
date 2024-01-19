import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        res.status(401).json({
            error: "Unauthorised",
            description: "You must be logged in to create a pack",
            fix: "Sign in to create a pack"
        });
        return;
    }

    return res.json({
        message: 'Success',
        userId: session.user.userId,
        email: session.user.email,
    })
}
