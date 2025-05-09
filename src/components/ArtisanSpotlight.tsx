"use client";

import { useState } from "react";
import Image from "next/image";
// import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Quote, Star, Gem, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock artisans data
const artisans = [
  {
    id: 1,
    name: "Priya Sharma",
    image: "/images/artisans/priya.png",
    category: "Textile Weaving",
    location: "Nagpur, Maharashtra",
    story: "A third-generation weaver, Priya has been creating handloom textiles for over 15 years, preserving traditional Maharashtrian patterns while introducing contemporary designs.",
    quote: "Every thread I weave carries the stories of my ancestors and the dreams of future generations.",
    rating: 4.9,
    reviewCount: 128,
    shopLink: "/artisans/priya-sharma",
    craftImages: [
      "/images/crafts/textile1.png",
      "/images/crafts/textile2.png",
      "/images/crafts/textile3.png"
    ],
    specialties: ["Hand-dyed Fabrics", "Traditional Patterns", "Sustainable Materials"]
  },
  {
    id: 2,
    name: "Rajesh Patel",
    image: "/images/artisans/rajesh.png",
    category: "Pottery & Ceramics",
    location: "Bhuj, Gujarat",
    story: "Rajesh learned pottery from his grandfather at the age of 8. After the 2001 earthquake destroyed his family workshop, he rebuilt it and now trains young artisans in traditional Kutch pottery techniques.",
    quote: "Clay speaks to those who listen. I'm just a medium between earth and art.",
    rating: 4.8,
    reviewCount: 94,
    shopLink: "/artisans/rajesh-patel",
    craftImages: [
      "/images/crafts/pottery1.png",
      "/images/crafts/pottery2.png",
      "/images/crafts/pottery3.png"
    ],
    specialties: ["Terracotta Pottery", "Glazed Ceramics", "Traditional Designs"]
  },
  {
    id: 3,
    name: "Lakshmi Devi",
    image: "/images/artisans/lakshmi.png",
    category: "Brass Metalwork",
    location: "Moradabad, Uttar Pradesh",
    story: "Coming from a family of traditional metalworkers, Lakshmi has revolutionized the craft by combining ancient techniques with modern sustainable practices, creating eco-friendly brass products.",
    quote: "Metal has memory. It remembers the hands that shape it and carries that energy to its new home.",
    rating: 4.7,
    reviewCount: 156,
    shopLink: "/artisans/lakshmi-devi",
    craftImages: [
      "/images/crafts/metal1.png",
      "/images/crafts/metal2.png",
      "/images/crafts/metal3.png"
    ],
    specialties: ["Eco-friendly Methods", "Decorative Pieces", "Functional Art"]
  }
];

export default function ArtisanSpotlight() {
  const [currentArtisan, setCurrentArtisan] = useState(0);
  const artisan = artisans[currentArtisan];

  const nextArtisan = () => {
    setCurrentArtisan((prev) => (prev === artisans.length - 1 ? 0 : prev + 1));
  };

  const prevArtisan = () => {
    setCurrentArtisan((prev) => (prev === 0 ? artisans.length - 1 : prev - 1));
  };

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-primary/5 rounded-br-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/3 bg-accent/10 rounded-tl-[80px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section heading with animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Local <span className="text-primary">Artisans</span> Spotlight
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the skilled craftspeople behind our unique products and their inspiring stories
          </p>
        </motion.div>
        
        {/* Artisan spotlight content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={artisan.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            {/* Left side - Artisan profile and story */}
            <div className="relative">
              {/* Circular artisan image */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mx-auto lg:mx-0"
              >
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-20">
                  <Image
                    src={artisan.image}
                    alt={artisan.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, 320px"
                  />
                </div>
                
                {/* Category badge */}
                <div className="absolute top-5 right-5 md:top-10 md:right-0 bg-white rounded-full px-4 py-2 shadow-md z-30">
                  <p className="text-primary font-medium text-sm">{artisan.category}</p>
                </div>
                
                {/* Rating badge */}
                <div className="absolute bottom-5 left-5 md:bottom-10 md:left-0 bg-white rounded-full px-4 py-2 shadow-md z-30 flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  <span className="font-medium text-sm">{artisan.rating}</span>
                  <span className="text-gray-500 text-xs ml-1">({artisan.reviewCount})</span>
                </div>
              </motion.div>
              
              {/* Spotlight effect - decorative rays */}
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 hidden lg:block">
                <svg width="150" height="300" viewBox="0 0 150 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 150L150 0" stroke="rgba(42, 74, 161, 0.2)" strokeWidth="2" strokeDasharray="6 4" />
                  <path d="M0 150L150 300" stroke="rgba(42, 74, 161, 0.2)" strokeWidth="2" strokeDasharray="6 4" />
                </svg>
              </div>
              
              {/* Artisan story box */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-accent rounded-xl p-6 md:p-8 mt-8 md:mt-[-2rem] md:ml-[8rem] relative z-10"
              >
                <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-2">{artisan.name}</h3>
                <div className="flex items-center mb-4">
                  <MapPin className="h-4 w-4 text-primary mr-1" />
                  <span className="text-gray-600 text-sm">{artisan.location}</span>
                </div>
                <p className="text-gray-700 mb-6">{artisan.story}</p>
                <div className="border-l-4 border-primary pl-4 italic text-gray-600">
                  <Quote className="h-5 w-5 text-primary mb-2 opacity-50" />
                  &quot;{artisan.quote}&quot;
                </div>
                <div className="mt-6">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-full">
                    Visit {artisan.name.split(' ')[0]}&apos;s Shop
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Right side - Craft showcase (replacing the map) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative mt-12 lg:mt-0"
            >
              {/* Decorative background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl"></div>
              
              {/* Craft specialties */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-sm"
              >
                <h4 className="font-heading text-xl text-foreground mb-4 flex items-center">
                  <Gem className="h-5 w-5 text-primary mr-2" />
                  Craft Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {artisan.specialties.map((specialty, index) => (
                    <span 
                      key={index} 
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </motion.div>
              
              {/* Craft images gallery */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="col-span-2"
                >
                  <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
                    <Image
                      src={artisan.craftImages[0]}
                      alt={`${artisan.name}'s craft`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="relative h-32 rounded-xl overflow-hidden shadow-md">
                    <Image
                      src={artisan.craftImages[1]}
                      alt={`${artisan.name}'s craft`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <div className="relative h-32 rounded-xl overflow-hidden shadow-md">
                    <Image
                      src={artisan.craftImages[2]}
                      alt={`${artisan.name}'s craft`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </motion.div>
              </div>
              
              {/* Artisan achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-primary mr-2" />
                    <h4 className="font-heading text-lg text-foreground">Recognition</h4>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="h-4 w-4 text-primary mr-1" />
                    <span>{Math.floor(Math.random() * 500) + 100} Favorites</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {artisan.name.split(' ')[0]}&apos;s work has been featured in national exhibitions and recognized for preserving cultural heritage through craft.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation arrows */}
        <div className="flex justify-center space-x-8 mt-12">
          <button 
            onClick={prevArtisan}
            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
            aria-label="Previous artisan"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex space-x-2">
            {artisans.map((_, index) => (
                            <button
                            key={index}
                            onClick={() => setCurrentArtisan(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === currentArtisan ? 'bg-primary' : 'bg-gray-300'
                            }`}
                            aria-label={`Go to artisan ${index + 1}`}
                          />
                        ))}
                      </div>
                      <button 
                        onClick={nextArtisan}
                        className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                        aria-label="Next artisan"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </section>
              );
            }
            