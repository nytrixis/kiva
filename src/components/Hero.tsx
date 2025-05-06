"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Carousel data for multiple slides
const carouselData = [
  {
    id: 1,
    heading: "Discover Unique Local Brands",
    description: "Shop from trusted local vendors and discover products with real recommendations.",
    image: "/images/model.png",
    stats: [
      { value: "8+", label: "Years Experience" },
      { value: "4k+", label: "Best Clients" },
      { value: "4.9", label: "Customer Rating" }
    ]
  },
  {
    id: 2,
    heading: "Handcrafted With Love",
    description: "Explore artisanal products made with passion and traditional techniques.",
    image: "/images/model1.png",
    stats: [
      { value: "100+", label: "Artisans" },
      { value: "500+", label: "Products" },
      { value: "12", label: "Categories" }
    ]
  },
  {
    id: 3,
    heading: "Sustainable Fashion",
    description: "Eco-friendly clothing that looks good and feels good for the planet.",
    image: "/images/model3.png",
    stats: [
      { value: "30%", label: "Less Water" },
      { value: "90%", label: "Recycled" },
      { value: "Zero", label: "Carbon Footprint" }
    ]
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Autoplay functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoplay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [autoplay]);
  // Navigation functions
  const nextSlide = () => {
    setAutoplay(false);
    setCurrentSlide((prev) => (prev === carouselData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setAutoplay(false);
    setCurrentSlide((prev) => (prev === 0 ? carouselData.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setAutoplay(false);
    setCurrentSlide(index);
  };
  return (
    <section className="min-h-screen h-screen md:h-screen relative overflow-hidden">
      {/* 60-40 division with background colors - adjusted for mobile */}
      <div className="absolute inset-0 flex">
        <div className="w-full md:w-[60%] bg-background"></div>
        <div className="hidden md:block md:w-[40%] bg-accent"></div>
      </div>
      
      {/* Mobile-only background for the bottom part */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-accent md:hidden"></div>
      
      {/* KIVA background pattern on the right side - hidden on small screens */}
      <div className="absolute right-0 top-0 w-[40%] h-full overflow-hidden hidden md:block">
        <div className="absolute inset-0 flex flex-wrap justify-center items-center opacity-5">
          {Array(20).fill(0).map((_, i) => (
            <div
              key={i}
              className="text-[#6c5a7c] font-heading text-8xl font-bold m-4 rotate-[-10deg]"
            >
              KIVA
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative elements for the right side - adjusted for mobile */}
      <div className="absolute right-0 top-0 w-full md:w-[40%] h-full z-10 overflow-hidden">
        {/* Floating circles with subtle animations - adjusted sizes for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[65%] right-[20%] md:top-[15%] w-10 h-10 md:w-16 md:h-16 rounded-full bg-white/30 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          className="absolute top-[75%] right-[40%] md:top-[35%] md:right-[10%] w-6 h-6 md:w-10 md:h-10 rounded-full bg-primary/20 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", delay: 0.3 }}
          className="absolute top-[85%] right-[10%] md:top-[60%] md:right-[25%] w-8 h-8 md:w-14 md:h-14 rounded-full bg-white/40 backdrop-blur-sm"
        />
      </div>
      
      {/* White circle positioned at the division line - adjusted for mobile */}
      <div className="absolute left-1/2 md:left-[60%] top-[55%] md:top-1/3 transform -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[350px] md:h-[350px] bg-white rounded-full z-10"></div>
      
      <div className="container mx-auto px-4 md:px-10 h-full flex items-center relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full"
          >
            {/* Left Column - Text Content - stacked on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 md:space-y-6 relative order-2 md:order-1 mt-8 md:mt-0"
            >
              <h1 className="font-heading text-3xl md:text-4xl lg:text-6xl font-bold text-[#111827] leading-tight">
                {carouselData[currentSlide].heading.split(' ').map((word, i, arr) => 
                  i === arr.length - 2 ? (
                    <span key={i}>
                      <span className="text-primary">{word}</span>{' '}
                    </span>
                  ) : (
                    <span key={i}>{word}{' '}</span>
                  )
                )}
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 max-w-md">
                {carouselData[currentSlide].description}
              </p>
              
              <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:space-x-4">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 md:px-8 py-5 md:py-6 rounded-full text-base md:text-lg w-full md:w-auto">
                  Shop Now
                </Button>
                
                <Badge className="bg-background border border-primary text-primary px-3 md:px-4 py-1 md:py-2 rounded-full text-sm whitespace-nowrap w-full md:w-auto text-center md:text-left">
                  24/7 free call services
                </Badge>
              </div>
              
              {/* Carousel Indicators - Repositioned for mobile */}
              <div className="absolute -bottom-16 md:-bottom-20 left-0 flex space-x-3 md:space-x-5 z-30">
                {carouselData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className="focus:outline-none"
                    aria-label={`Go to slide ${index + 1}`}
                  >
                    <div className="w-8 md:w-10 h-1 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor: index === currentSlide
                          ? 'var(--color-primary)'
                          : 'rgba(156, 163, 175, 0.5)'
                      }}
                    ></div>
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Right Column - Image positioned to overlap the division - adjusted for mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative order-1 md:order-2 -mt-6 md:mt-0"
            >
              <div className="relative h-[350px] md:h-[500px] lg:h-[610px] w-[100%] md:w-[60%] transform translate-x-0 md:-translate-x-[20%]">
                <Image
                  src={carouselData[currentSlide].image}
                  alt="Fashion Model"
                  fill
                  className="object-contain md:object-cover object-center z-20"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              
              {/* Stats - repositioned for mobile */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="absolute top-[5%] right-[5%] md:top-[20%] md:left-[55%] z-30"
              >
                <div className="flex flex-col space-y-10 md:space-y-20 items-start">
                  {carouselData[currentSlide].stats.map((stat, index) => (
                    <div key={index} className="text-left">
                      <p className="text-primary font-bold text-2xl md:text-4xl">{stat.value}</p>
                      <p className="text-xs md:text-sm text-gray-700">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
        
        {/* Carousel Navigation Arrows - adjusted for mobile */}
        <div className="absolute left-0 right-0 top-[30%] md:top-1/2 transform -translate-y-1/2 flex justify-between px-2 md:px-4 z-30">
          <button 
            onClick={prevSlide}
            className="bg-white/80 backdrop-blur-sm p-1 md:p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </button>
          <button 
            onClick={nextSlide}
            className="bg-white/80 backdrop-blur-sm p-1 md:p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </button>
        </div>
      </div>
    </section>
  );
}
