import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { compare } from "bcrypt";

export type UserRole = "CUSTOMER" | "SELLER" | "ADMIN" | "INFLUENCER";

// Module augmentation for NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    role: UserRole;
    image?: string | null;
    isOnboarded: boolean;
  }

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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: NextAuthOptions = {
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
          // Query user from Supabase
          const { data: users, error } = await supabase
            .from("User")
            .select("*")
            .eq("email", credentials.email)
            .limit(1);

          if (error || !users || users.length === 0) {
            return null;
          }

          const user = users[0];

          if (!user.password) {
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
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};