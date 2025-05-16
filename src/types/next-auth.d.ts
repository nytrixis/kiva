export type UserRole = "CUSTOMER" | "SELLER" | "ADMIN" | "INFLUENCER";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    phone?: string | null;
    location?: string | null;
    isOnboarded: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      phone?: string | null;
      location?: string | null;
      isOnboarded: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    isOnboarded: boolean;
  }
}