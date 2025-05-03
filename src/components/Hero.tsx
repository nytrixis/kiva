"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="min-h-screen bg-[#fff9f9] flex flex-col justify-center relative">
        <div className="absolute right-0 md:right-[10%] top-[300px] md:top-[300px] w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] bg-red rounded-full -z-10 transform translate-x-1/4"></div>
      <div className="container mx-auto px-10 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-[#111827] leading-tight">
              Discover Unique <span className="text-primary">Local</span> Brands
            </h1>
            
            <p className="text-lg text-gray-600 max-w-md">
              Shop from trusted local vendors and discover products with real recommendations.
            </p>
            
            <div className="flex items-center space-x-4">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg">
                Shop Now
              </Button>
              
              <Badge className="bg-background text-primary px-4 py-2 rounded-full">
                24/7 free call services
              </Badge>
            </div>
          </motion.div>
          
          {/* Right Column - Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-[500px] w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E6E6FA]/40 to-transparent rounded-full -z-10 transform scale-95"></div>
              <Image
                src="/images/model.jpg" 
                alt="Fashion Model"
                fill
                className="object-cover object-center rounded-2xl"
                priority
              />
            </div>
            
            {/* Stats at bottom right */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-primary font-bold text-xl">8+</p>
                  <p className="text-xs text-gray-600">Experience</p>
                </div>
                <div>
                  <p className="text-primary font-bold text-xl">4k+</p>
                  <p className="text-xs text-gray-600">Best Clients</p>
                </div>
                <div>
                  <p className="text-primary font-bold text-xl">4.9</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
