import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth/[...nextauth]";
import { DetailedUser, Pack, User } from "~/utils/types";
import db from "~/utils/drizzle";
import { users as dbUsers, packs as dbPacks } from "~/db/schema"
import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { generateUsername } from "unique-username-generator";


const generateAvatar = () => {
    // Random from 0 to 4 (inclusive)
    const random = Math.floor(Math.random() * 5);
    return `${process.env.NEXTAUTH_URL}/avatars/${random}.png`;
};


export default async (req: NextApiRequest, res: NextApiResponse) => {
    /*
    GET: Returns public account data for other users, or detailed info for the current user.
        Optionally, "userId" can be specified to get data for a specific user. By default use the current user.
        If not logged in, only public data is returned. If not logged in and "userId" isn't provided, error.
    PATCH: Updates the data of the current user.
    DELETE: Deletes the current user.
    POST: Creates a new user.
    */
    const session = await getServerSession(req, res, authOptions)
    // Get the type of request (GET, POST, etc.)
    const method = req.method;

    switch (method) {
        case "GET": {
            // Get the username from the query string
            let username = req.query.username as string | undefined;
            if (!session && !username) {
                return res.status(404).json({
                    error: "Not found",
                    description: "You must provide an account to view",
                    fix: "Specify a username to view another user's account"
                });
            } else if (username) {
                const userData: InferSelectModel<typeof dbUsers> | undefined = (await db.select().from(dbUsers)
                    .where(eq(dbUsers.username, username)).limit(1))[0];
                if (!userData) {
                    res.status(404).json({
                        error: "Not found",
                        description: "The specified user does not exist",
                        fix: "Check the username is correct"
                    });
                    return;
                }
                const userPacks: InferSelectModel<typeof dbPacks>[] = await db.select().from(dbPacks)
                    .where(eq(dbPacks.owner, userData.id)).orderBy(dbPacks.created_at);

                return res.json({
                    message: "Returned user's account data",
                    userId: userData.id,
                    avatar: userData.avatar,
                    packs: userPacks.filter(pack => pack.visibility == "public"),
                })
            } else {
                const userByEmail: { username: string } | undefined = (await db.select({ username: dbUsers.username}).from(dbUsers)
                    .where(eq(dbUsers.email, session?.user.email as string)).limit(1))[0];

                if (!userByEmail) {
                    return res.status(401).json({
                        error: "Forbidden",
                        description: "The specified user does not exist",
                        fix: "Check the username is correct"
                    });
                }

                const userData: InferSelectModel<typeof dbUsers> | undefined = (await db.select().from(dbUsers)
                    .where(eq(dbUsers.username, userByEmail.username)).limit(1))[0];

                const userPacks: InferSelectModel<typeof dbPacks>[] = await db.select().from(dbPacks)
                    .where(eq(dbPacks.owner, userData.id)).orderBy(dbPacks.created_at);

                return res.json({
                    message: "Returned user's account data",
                    userId: userData.id,
                    avatar: userData.avatar,
                    packs: userPacks,
                })
            }
        }
        case "POST": {
            if (!session) {
                return res.status(403).json({
                    error: "Unauthorized",
                    description: "Session does not exist",
                    fix: "Please login / signup"
                });
            }
            let user: InferInsertModel<typeof dbUsers> = {
                username: session.user.preferredUsername ?? generateUsername(), // TODO: what happens if the username is already used?
                email: session.user.email,
                avatar: session.user.image ?? generateAvatar()
            };
            switch (session.user.authProvider) {
                case "clicks": {
                    user.clicksId = session.user.providerId
                    break;
                }
                case "google": {
                    user.googleId = session.user.providerId
                    break;
                }
                case "github": {
                    user.githubId = session.user.providerId
                    break;
                }
                case "discord": {
                    user.discordId = session.user.providerId
                    break;
                }
            }
            db.insert(dbUsers).values(user)
            break;
        };
    };
};
