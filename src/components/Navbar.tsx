"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="bg-[#fff9f9] sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Updated to use Image */}
          <Link href="/" className="flex items-center">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#E6E6FA]">
              <Image
                src="/images/logo.png"
                alt="Kiva Logo"
                fill
                className="object-cover"
                sizes="48px"
                priority
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/collections" className="text-gray-600 hover:text-[#3D5AFE] transition-colors">
              Collections
            </Link>
            <Link href="/brands" className="text-gray-600 hover:text-[#3D5AFE] transition-colors">
              Brands
            </Link>
            <Link href="/new" className="text-gray-600 hover:text-[#3D5AFE] transition-colors">
              New
            </Link>
            <Link href="/sales" className="text-gray-600 hover:text-[#3D5AFE] transition-colors">
              Sales
            </Link>
          </nav>
          
          {/* Cart and Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-[#3D5AFE] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t"
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link href="/collections" className="block text-gray-600 hover:text-[#3D5AFE]">
              Collections
            </Link>
            <Link href="/brands" className="block text-gray-600 hover:text-[#3D5AFE]">
              Brands
            </Link>
            <Link href="/new" className="block text-gray-600 hover:text-[#3D5AFE]">
              New
            </Link>
            <Link href="/sales" className="block text-gray-600 hover:text-[#3D5AFE]">
              Sales
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
