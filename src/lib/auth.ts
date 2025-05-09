// import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Define types for JWT and Session
type ExtendedUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: UserRole;
  image?: string | null;
  isOnboarded: boolean;
}

declare module "next-auth" {
  interface User extends ExtendedUser {}
  
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role: string;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  // Remove PrismaAdapter for now as it might be causing issues
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/error",
    verifyRequest: "/verify-request",
    newUser: "/onboarding",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });
          
          if (!user || !user.password) {
            return null;
          }
          
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            isOnboarded: user.isOnboarded,
          };
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
