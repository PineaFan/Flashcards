import { DefaultJWT } from "next-auth/jwt";
declare module 'next-auth/jwt' {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT extends DefaultJWT {
        userId?: string
        username?: string
        providerId: string
        authProvider: string
    }
}
