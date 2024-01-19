import { GetServerSidePropsContext } from "next"
import NextAuth, { getServerSession, AuthOptions, User } from "next-auth"
import GithubProvider from "next-auth/providers/github"
import DiscordProvider from "next-auth/providers/discord"
import GoogleProvider from "next-auth/providers/google"
import KeycloakProvider from "next-auth/providers/keycloak"
import db from "~/utils/drizzle"
import { users } from "~/db/schema"
import { InferInsertModel, eq } from "drizzle-orm"
import { generateUsername } from "unique-username-generator"

export const authOptions: AuthOptions = {
    jwt: {
        secret: process.env.NEXTAUTH_SECRET || "",
    },
    // Configure one or more authentication providers
    providers: [
        KeycloakProvider({
            authorization: { params: { scope: "openid email profile" } },
            clientId: process.env.CLICKS_ID || "",
            clientSecret: process.env.CLICKS_SECRET || "",

            name: "Clicks",
            style: {logo: "https://assets.clicks.codes/company/mouse/white.svg", bg: "#6576CC", text: "#FFFFFF"},

            issuer: "https://login.clicks.codes/realms/master",
            async profile(profile) {
                console.log(profile)
                return {
                    id: profile.sub,
                    name: profile.name ?? profile.preferred_username,
                    email: profile.email,
                    image: profile.picture,
                    preferredUsername: profile.preferred_username,
                } as User
            },
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_ID || "",
            clientSecret: process.env.DISCORD_SECRET || ""
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID || "",
            clientSecret: process.env.GOOGLE_SECRET || ""
        })
    ],
    callbacks: {
        async jwt({account, token}) {
            console.log(token, account)
            if (account) {
                token.providerId = token.sub ?? "";
                token.authProvider = account.provider.replace("keycloak", "clicks");

                const dbUser: { userId:string, username: string} | undefined = (await db.select({userId: users.id, username: users.username})
                    .from(users).where(eq(users.email, token.email as string)))[0];
                const withUsername: { userId:string, username: string} | undefined = (await db.select({userId: users.id, username: users.username})
                    .from(users).where(eq(users.username, token.preferredUsername as string)))[0];

                // if (!dbUser) {
                //     let user: InferInsertModel<typeof users> = {
                //         username: token.preferredUsername ?? generateUsername(), // TODO: what happens if the username is already used?
                //         email: session.user.email,
                //         avatar: session.user.image ?? generateAvatar()
                //     };
                //     switch (session.user.authProvider) {
                //         case "clicks": {
                //             user.clicksId = session.user.providerId
                //             break;
                //         }
                //         case "google": {
                //             user.googleId = session.user.providerId
                //             break;
                //         }
                //         case "github": {
                //             user.githubId = session.user.providerId
                //             break;
                //         }
                //         case "discord": {
                //             user.discordId = session.user.providerId
                //             break;
                //         }
                //     }
                //     db.insert(dbUsers).values(user)
                //     break;
                // }
                
                token.userId = dbUser.userId;
                token.username = dbUser.username;

            }
            return token
        },
        async session({ session, token }) {
            session.user.userId = token.userId;
            session.user.username = token.username
            session.user.providerId = token.providerId;
            session.user.authProvider = token.authProvider;
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "",
}

export default NextAuth(authOptions)

export const getServerAuthSession = (ctx: {
    req: GetServerSidePropsContext["req"];
    res: GetServerSidePropsContext["res"];
}) => {
    return getServerSession(ctx.req, ctx.res, authOptions);
};
