"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  
  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    return result;
  };
  
  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };
  
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
