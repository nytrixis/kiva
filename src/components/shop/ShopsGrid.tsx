"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Tag, ExternalLink } from "lucide-react";

interface Shop {
  id: string;
  businessName: string;
  businessType: string;
  description?: string | null;
  logoImage?: string | null;
  bannerImage?: string | null;
  categories: string[];
  city: string;
  state: string;
  country: string;
  avgRating: number;
  user: {
    id: string;
    name: string | null;
  };
}

interface ShopsGridProps {
  shops: Shop[];
}

export default function ShopsGrid({ shops }: ShopsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {shops.map((shop, index) => (
        <ShopCard key={shop.id} shop={shop} index={index} />
      ))}
    </div>
  );
}

function ShopCard({ shop, index }: { shop: Shop; index: number }) {
  // Truncate description to a reasonable length
  const truncatedDescription = shop.description 
    ? shop.description.length > 120 
      ? shop.description.substring(0, 120) + '...' 
      : shop.description
    : 'No description available';
    
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="relative bg-white rounded-xl shadow-sm overflow-hidden"
    >
      {/* Banner image */}
      <div className="relative h-32 w-full bg-accent/30">
        {shop.bannerImage ? (
          <Image
            src={shop.bannerImage}
            alt={`${shop.businessName} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <span className="text-primary text-4xl font-heading">Kiva</span>
          </div>
        )}
      </div>
      
      {/* Logo */}
      <div className="absolute top-16 left-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          className="relative h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white"
        >
          <Image
            src={shop.logoImage || "/images/placeholder-logo.jpg"}
            alt={shop.businessName}
            fill
            className="object-cover"
            sizes="80px"
          />
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="pt-16 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-heading text-xl text-primary mb-1">{shop.businessName}</h3>
            <p className="text-sm text-gray-600 mb-2">{shop.businessType}</p>
          </div>
          
          <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
            <Star className="h-3 w-3 text-primary fill-primary mr-1" />
            <span className="text-xs font-medium text-primary">
              {shop.avgRating.toFixed(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{shop.city}, {shop.state}, {shop.country}</span>
        </div>
        
        {/* Description with lavender background */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          className="bg-accent/20 p-4 rounded-lg mb-4"
        >
          <p className="text-sm text-primary/90">{truncatedDescription}</p>
        </motion.div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {shop.categories.map((category, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.4 + (i * 0.05) }}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
            >
              <Tag className="h-3 w-3 mr-1" />
              {category}
            </motion.span>
          ))}
        </div>
        
        {/* View shop button */}
        <Link href={`/shops/${shop.id}`}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            <span>View Shop</span>
            <ExternalLink className="h-4 w-4 ml-2" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
