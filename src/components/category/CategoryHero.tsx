"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface Category {
  name: string;
  description?: string;
  bannerImage?: string;
  productCount?: number;
}

interface CategoryHeroProps {
  category: Category;
}

export default function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={category.bannerImage || "/images/categories/default-banner.jpg"}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            {category.name}
          </h1>
          
          <p className="text-white/90 max-w-xl text-sm md:text-base">
            {category.description}
          </p> */}
          
          {category.productCount && (
      <div
        className="absolute left-5 md:left-20"
        style={{ bottom: 50 }}
      >
        <div className="mb-0 inline-block bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
          {category.productCount} products
        </div>
      </div>
    )}
        </motion.div>
      </div>
    </div>
  );
}
