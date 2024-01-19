import { DefaultUser, TokenSet, DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * The shape of the user object returned in the OAuth providers' `profile` callback,
     * or the second parameter of the `session` callback, when using a database.
     */
    interface User extends DefaultUser {
        userId?: string;
        providerId: string;
        authProvider: string;
        username?: string;
        preferredUsername?: string;
        name: string;
        email: string;
    }
    /**
     * The shape of the account object returned in the OAuth providers' `account` callback,
     * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
     */
    interface Account extends TokenSet {
        username: string;
    }

    /**
     * Returned by `useSession`, `auth`, contains information about the active session.
     */
    interface Session extends DefaultSession {
        user: User;
    }
}
