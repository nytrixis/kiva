"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Package,
  ShoppingBag,
  Settings,
  ChevronRight,
  Home,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  {
    title: "Overview",
    icon: Home,
    href: "/dashboard/seller",
  },
  {
    title: "Profile",
    icon: User,
    href: "/dashboard/seller/profile",
  },
  {
    title: "Products",
    icon: Package,
    href: "/dashboard/seller/products",
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    href: "/dashboard/seller/orders",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/seller/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/dashboard/seller" className="flex items-center">
              <div className="relative h-8 w-8 overflow-hidden">
                <img
                  src="/images/logob.png"
                  alt="Kiva Logo"
                  className="object-cover"
                />
              </div>
              <span className="ml-2 font-heading text-xl text-primary">
                Kiva
              </span>
            </Link>
          )}
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
