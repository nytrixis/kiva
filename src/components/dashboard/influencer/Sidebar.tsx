"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Video,
  BadgePercent,
  FileText,
  Home,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";

const menuItems = [
  {
    title: "Overview",
    icon: Home,
    href: "/dashboard/influencer",
  },
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/influencer/profile",
  },
  {
    title: "Reels",
    icon: Video,
    href: "/dashboard/influencer/reels",
  },
  {
    title: "Referrals",
    icon: BadgePercent,
    href: "/dashboard/influencer/referrals",
  },
  {
    title: "KYC",
    icon: FileText,
    href: "/dashboard/influencer/kyc",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profile, setProfile] = useState<{ image?: string; name?: string } | null>(null);

  useEffect(() => {
    // Fetch influencer profile for sidebar avatar
    fetch("/api/user/influencer-profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          image: data.profile?.image,
          name: data.profile?.user?.name || "",
        });
      });
  }, []);

  // Helper for fallback avatar
  const getInitial = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar top: avatar, vertical dots icon and divider */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            {/* Profile avatar or initial */}
            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {profile?.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || "Avatar"}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              ) : (
                <span className="text-primary font-bold text-lg">
                  {getInitial(profile?.name)}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="ml-2 font-heading text-lg text-primary">
                Dashboard
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              isCollapsed ? "mx-auto" : ""
            }`}
          >
            <ChevronRight
              className={`h-5 w-5 text-gray-500 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive ? "text-primary" : "text-gray-500"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{item.title}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto h-2 w-2 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center w-full px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
            {!isCollapsed && (
              <span className="ml-3 font-medium">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
    );
}