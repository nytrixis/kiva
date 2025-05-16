"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Handcrafted Jewelry",
    slug: "jewelry-accessories",
    description: "Unique pieces made by local artisans",
    image: "/images/categories/jewelry.png",
  },
  {
    name: "Handcrafted",
    slug: "handcrafted",
    description: "Handmade products from local artisans",
    image: "/images/categories/home-decor.png",
  },
  {
    name: "Clothing & Fashion",
    slug: "clothing",
    description: "Apparel and fashion items",
    image: "/images/categories/fashion.png",
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Beauty products and personal care items",
    image: "/images/categories/wellness.png",
  },
  {
    name: "Artisanal Foods",
    slug: "food-beverages",
    description: "Locally-sourced delicacies",
    image: "/images/categories/foods.png",
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    description: "Toys, games, and entertainment items",
    image: "/images/categories/crafts.png",
  },
];

export default function FeaturedCategories() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/category-counts");
        const data = await res.json();
        setItemCounts(data); // { [slug]: count }
      } catch {
        // fallback: set all to 0
        const fallback: Record<string, number> = {};
        categories.forEach(cat => { fallback[cat.slug] = 0; });
        setItemCounts(fallback);
      }
    };
    fetchCounts();
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-background opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-2/3 bg-accent opacity-10 rounded-tl-[100px]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Explore Our <span className="text-primary">Categories</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover unique products from local artisans across these carefully curated collections
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredCategory(category.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="group"
            >
              <Link href={`/categories/${category.slug}`} className="block">
                <div className="relative overflow-hidden rounded-2xl shadow-sm h-[300px] transition-all duration-500">
                  <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-105">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300 ease-out">
                    <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm text-white/80 mb-2 line-clamp-2">{category.description}</p>
                    <div className="flex items-center text-xs text-white/70">
                      <span>{itemCounts[category.slug] ?? 0} items</span>
                      <span className="ml-auto text-white group-hover:translate-x-1 transition-transform duration-300">
                        Explore →
                      </span>
                    </div>
                  </div>
                  <div 
                    className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-primary transition-all duration-300 ${
                      hoveredCategory === category.slug ? 'scale-[3] opacity-70' : 'scale-100 opacity-50'
                    }`}
                  ></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-20 h-20 rounded-full bg-accent/10 blur-xl"></div>
      </div>
    </section>
  );
}