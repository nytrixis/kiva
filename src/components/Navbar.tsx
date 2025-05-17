"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Menu, X, Globe, ChevronDown, Search, User, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CategoryResponse {
  categories: Array<{id: string, name: string, slug: string}>;
}

interface Language {
  code: string;
  name: string;
}

// Define Google Translate interface
interface GoogleTranslate {
  TranslateElement: (options: {
    pageLanguage: string;
    includedLanguages: string;
    autoDisplay: boolean;
  }, elementId: string) => void;
}

interface GoogleWindow extends Window {
  google?: {
    translate: GoogleTranslate;
  };
}

// Indian languages for the dropdown
const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "ur", name: "اردو (Urdu)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([]);
  const [mobileCategories] = useState<string[]>([]);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  
  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json() as CategoryResponse;
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch wishlist and cart counts
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch wishlist count
      const fetchWishlistCount = async () => {
        try {
          const response = await fetch('/api/wishlist/count');
          if (response.ok) {
            const data = await response.json();
            setWishlistCount(data.count);
          }
        } catch (error) {
          console.error("Error fetching wishlist count:", error);
        }
      };

      const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false); // Optionally close mobile menu on search
    }
  };
      
      // Fetch cart count
      const fetchCartCount = async () => {
        try {
          const response = await fetch('/api/cart/count');
          if (response.ok) {
            const data = await response.json();
            setCartCount(data.count);
          }
        } catch (error) {
          console.error("Error fetching cart count:", error);
        }
      };
      
      fetchWishlistCount();
      fetchCartCount();
    }
  }, [isAuthenticated]);
  
  // Function to change language using Google Translate
  const changeLanguage = (languageCode: string) => {
    if (typeof window !== 'undefined' && 
        (window as GoogleWindow).google && 
        (window as GoogleWindow).google?.translate) {
      const selectedLang = languages.find(lang => lang.code === languageCode);
      if (selectedLang) {
        setSelectedLanguage(selectedLang);
        (window as GoogleWindow).google?.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: languageCode,
          autoDisplay: false
        }, 'google_translate_element');
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // This would connect to your backend search functionality
    // For now, just log the search query
    console.log("Search query:", searchQuery);
    
    /*
    // Uncomment this when you have backend integration
    const searchProducts = async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        // Handle search results
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };
    searchProducts();
    */
  };
  
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Rest of the component remains unchanged */}
      {/* 60-40 division with background colors */}
      <div className="relative">
        <div className="absolute inset-0 flex">
          <div className="w-[60%] bg-background"></div>
          <div className="w-[40%] bg-accent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center h-16">
            {/* Left section (60%) - Logo and Navigation */}
            <div className="w-[60%] flex items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center pr-20">
                <div className="relative h-10 w-10 overflow-hidden border border-[#E6E6FA]">
                  <Image
                    src="/images/logob.png"
                    alt="Kiva Logo"
                    fill
                    className="object-cover"
                    sizes="40px"
                    priority
                  />
                </div>
              </Link>
              
              {/* Desktop Navigation - positioned in the left section */}
              <nav className="hidden md:flex items-center space-x-8 ml-10">
                {/* Categories Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center text-gray-600 hover:text-primary transition-colors">
                      Categories
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 bg-accent border-accent">
                    {(categories || []).length > 0 ? (
                      categories.map((category) => (
                        <DropdownMenuItem key={category.id} asChild className="hover:bg-white focus:bg-white">
                          <Link href={`/categories/${category.slug}`} className="w-full">
                            {category.name}
                          </Link>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No categories found</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Marketplace Link */}
                <Link href="/marketplace" className="text-gray-600 hover:text-primary transition-colors flex items-center">
                  <Grid className="mr-1 h-4 w-4" />
                  Xplore
                </Link>
                
                <Link href="/reels" className="text-gray-600 hover:text-primary transition-colors">
                  Peeks
                </Link>
                
                <Link href="/shops" className="text-gray-600 hover:text-primary transition-colors">
                  Shops
                </Link>
                
                <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
                  About
                </Link>
              </nav>
            </div>
            
            <div className="hidden md:flex items-center ml-4 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className={`flex items-center bg-white/80 backdrop-blur-sm rounded-full transition-all duration-300 border ${isSearchFocused ? 'border-primary shadow-sm pr-12' : 'border-muted pr-2'}`}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="py-2 pl-4 pr-2 w-48 focus:w-64 transition-all duration-300 bg-transparent outline-none text-sm text-foreground placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className={`${isSearchFocused ? 'absolute right-2' : ''} p-2 text-gray-500 hover:text-primary transition-colors`}
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
            {/* Right section (40%) - Icons */}
            <div className="w-[40%] flex items-center justify-end space-x-6">
              {/* Authentication Buttons - Show when not authenticated */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                /* User Menu - Show when authenticated */
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-accent border-accent">
                    <DropdownMenuItem className="cursor-default font-medium">
                      {user?.name || 'User'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/dashboard" className="w-full hover:bg-white focus:bg-white">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/profile" className="w-full hover:bg-white focus:bg-white">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Wishlist Button */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onMouseEnter={() => setIsWishlistHovered(true)}
                  onMouseLeave={() => setIsWishlistHovered(false)}
                >
                  <Heart
                    className={`h-5 w-5 transition-all ${isWishlistHovered ? 'fill-primary text-primary' : 'text-gray-600'}`}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
              
              {/* Cart Button */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              
              {/* Language Selector Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1 px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-50">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{selectedLanguage.code.toUpperCase()}</span>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language.code}
                      className="cursor-pointer"
                      onClick={() => changeLanguage(language.code)}
                    >
                      {language.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Menu Button */}
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
      </div>
      
            {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t"
        >
          <div className="pt-2 pb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center bg-white/90 rounded-full border border-muted">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-2 pl-4 pr-2 w-full bg-transparent outline-none text-sm text-foreground placeholder:text-gray-400"
                />
                
                <button
                  type="submit"
                  className="p-2 text-gray-500 hover:text-primary transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                className="flex items-center justify-between w-full text-gray-600 hover:text-primary"
              >
                <span className="flex items-center">
                  <Grid className="mr-2 h-4 w-4" />
                  Categories
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileCategories ? 'rotate-180' : ''}`} />
              </button>
              
              {isMobileCategoriesOpen && (
                <div className="mt-2 pl-6 space-y-2">
                  {(categories || []).length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="block text-gray-600 hover:text-primary py-1"
                      >
                        {category.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories found</p>
                  )}
                </div>
              )}
            </div>
            
            <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-primary">
              <Grid className="mr-2 h-4 w-4" />
              Xplore
            </Link>
            
            <Link href="/reels" className="block text-gray-600 hover:text-primary">
              Peeks
            </Link>
            <Link href="/about" className="block text-gray-600 hover:text-primary">
              About
            </Link>
            {/* <Link href="/sales" className="block text-gray-600 hover:text-primary">
              Sales
            </Link> */}
            
            {/* Authentication Links for Mobile */}
            <div className="pt-4 border-t border-gray-100">
              {!isAuthenticated ? (
                <>
                  <Link href="/sign-in" className="block text-gray-600 hover:text-primary py-2">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="block text-gray-600 hover:text-primary py-2">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="block text-gray-600 hover:text-primary py-2">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="block text-gray-600 hover:text-primary py-2">
                    Profile
                  </Link>
                  <Link href="/wishlist" className="block text-gray-600 hover:text-primary py-2">
                    Wishlist
                  </Link>
                  <Link href="/cart" className="block text-gray-600 hover:text-primary py-2">
                    Cart
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left text-gray-600 hover:text-primary py-2"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
