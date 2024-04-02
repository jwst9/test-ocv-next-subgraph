import { PrismaAdapter } from "@auth/prisma-adapter"
import {
  getServerSession,
  type Session,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth"
import { type Adapter } from "next-auth/adapters"
import CredentialsProvider from "next-auth/providers/credentials"
import { createHash } from "crypto"
import { db } from "~/server/db"
import { env } from "~/env"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
    } & DefaultSession["user"]
  }
}

export const pwdhash = (pwd: string) => createHash("sha256").update(pwd).digest('hex')

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      token.user = user
      return token
    },
    session: ({ session, token }) => {
      session.user = token.user as Session["user"]
      return session
    },
  },
  adapter: PrismaAdapter(db) as Adapter,
  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      id: 'user-credential',
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "foo@bar.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === undefined || credentials?.password === undefined) {
          return null
        }

        const user = await db.user.findFirst({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        const isPasswordMatch = pwdhash(credentials.password) === user.password

        if (!isPasswordMatch) {
          return null
        }

        return user
      }
    })
  ],
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions)
