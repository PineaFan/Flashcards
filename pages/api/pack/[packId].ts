import { packVisibilityEnum } from '../../../db/schema';
import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { DetailedUser, Pack } from "../../../utils/types"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    /*
    GET: Returns the data of a pack if the user has permission to view it.
    PATCH: Updates the data of a pack if the user has permission to edit it.
    DELETE: Deletes a pack if the user has permission to edit it.
    */
    const session = await getServerSession(req, res, authOptions)
    const packId = req.query.packId as string;

    // Get the pack data
    const packData: Pack | undefined = undefined;

    if (!packData) {
        res.status(404).json({
            error: "Not found",
            description: "The specified pack does not exist",
            fix: "Check the packId is correct"
        });
        return;
    }

    if (req.method === "GET") {
        if (packData.visibility !== "public" && !session) {
            return res.status(401).json({
                error: "Unauthorised",
                description: "You must be logged in to view this pack",
                fix: "Log in to view this pack"
            });
        }
        if (packData.visibility !== "public") {
            // Get the detailed user info
            // Make a GET request to /api/account?userId=packData.owner
            const userData: DetailedUser | undefined = await fetch(`http://localhost:3000/api/account?userId=${session!.user.userId}`)
                .then(res => res.json());
            if (!userData) {
                // The user doesn't exist anymore
                res.status(404).json({
                    error: "Not found",
                    description: "The owner of this pack no longer exists",
                    fix: "Contact the pack owner"
                });
                return;
            }
            // Check if the user is in ownedPacks or savedPacks
            if (!userData.ownedPacks.includes(packId) && !userData.savedPacks.includes(packId)) {
                res.status(401).json({
                    error: "Unauthorised",
                    description: "You do not have permission to view this pack",
                    fix: "Contact the pack owner"
                });
                return;
            }
        }
        // Return the pack data
        res.json({
            message: "Returned pack data",
            packId: packData.id,
            name: packData.name,
            description: packData.description,
            visibility: packData.visibility,
            cards: packData.cards,
            colour: packData.colour,
        })
        return;
    }
    if (!session) {
        res.status(401).json({
            error: "Unauthorised",
            description: "You must be logged in to modify a pack",
            fix: "Log in to modify a pack"
        });
        return;
    }
}
