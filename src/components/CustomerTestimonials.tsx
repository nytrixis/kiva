"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";
import { Star, Quote } from "lucide-react";

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai, India",
    avatar: "/images/testimonials/avatar-1.png",
    rating: 5,
    text: "The handcrafted jewelry I purchased is absolutely stunning. The attention to detail and quality is exceptional, and I love knowing that my purchase supports local artisans.",
    product: "Silver Filigree Earrings"
  },
  {
    id: 2,
    name: "Raj Patel",
    location: "Ahmedabad, Gujarat",
    avatar: "/images/testimonials/avatar-2.png",
    rating: 5,
    text: "I've been searching for authentic, traditional home decor items for years. Kiva has connected me with incredible craftspeople whose work transforms my living space.",
    product: "Hand-painted Ceramic Vase"
  },
  {
    id: 3,
    name: "Ananya Desai",
    location: "Bangalore, Karnataka",
    avatar: "/images/testimonials/avatar-3.png",
    rating: 4,
    text: "The sustainable clothing options are not only eco-friendly but also incredibly stylish. I receive compliments every time I wear my Kiva purchases!",
    product: "Organic Cotton Dress"
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    avatar: "/images/testimonials/avatar-4.png",
    rating: 5,
    text: "As someone who values heritage and tradition, I'm impressed by how Kiva preserves cultural craftsmanship while making it accessible to modern consumers.",
    product: "Traditional Block Print Scarf"
  },
  {
    id: 5,
    name: "Meera Kapoor",
    location: "Delhi, India",
    avatar: "/images/testimonials/avatar-5.png",
    rating: 5,
    text: "The wellness products I ordered exceeded my expectations. Made with natural ingredients and traditional knowledge, they've become essential in my daily routine.",
    product: "Ayurvedic Skincare Set"
  },
  {
    id: 6,
    name: "Arjun Mehta",
    location: "Kolkata, West Bengal",
    avatar: "/images/testimonials/avatar-6.png",
    rating: 5,
    text: "I purchased several items as gifts, and my family was blown away by the quality and uniqueness. The packaging was also beautiful and eco-friendly!",
    product: "Handwoven Textile Wall Hanging"
  }
];

// Duplicate testimonials to create seamless infinite loop
const duplicatedTestimonials = [...testimonials, ...testimonials];

export default function CustomerTestimonials() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  // Infinite scroll animation
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Clone the first set of items and append to the end for seamless looping
    const scrollWidth = carousel.scrollWidth / 2;
    let scrollPos = 0;
    
    const scroll = () => {
      if (!carousel) return;
      
      scrollPos += 0.5; // Adjust speed here
      
      // Reset position when we've scrolled through the first set
      if (scrollPos >= scrollWidth) {
        scrollPos = 0;
        carousel.scrollLeft = 0;
      } else {
        carousel.scrollLeft = scrollPos;
      }
      
      requestAnimationFrame(scroll);
    };
    
    const animation = requestAnimationFrame(scroll);
    
    return () => cancelAnimationFrame(animation);
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-24 relative overflow-hidden bg-background"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/5"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 rounded-tl-full bg-primary/5"></div>
      <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full bg-primary/10"></div>
      <div className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full bg-primary/10"></div>
      
      {/* Large quote icon */}
      <div className="absolute top-20 right-20 text-primary/5">
        <Quote className="w-40 h-40" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            What Our <span className="text-primary">Customers</span> Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real experiences from people who share our passion for authentic, handcrafted products
          </p>
        </motion.div>
        
        {/* Testimonials carousel */}
        <div className="relative">
          {/* Gradient overlays for seamless effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-background to-transparent"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-background to-transparent"></div>
          
          {/* Infinite scroll container */}
          <div 
            ref={carouselRef}
            className="flex overflow-x-hidden gap-6 py-8"
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${testimonial.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.5) }}
                className="flex-shrink-0 w-[350px] bg-white rounded-2xl shadow-md overflow-hidden"
              >
                {/* Card header with accent color */}
                <div className="bg-primary/10 p-6">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg text-primary">{testimonial.name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                      
                      {/* Star rating */}
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'fill-primary text-primary' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Testimonial content */}
                <div className="p-6 relative">
                  {/* Quote icon */}
                  <div className="absolute top-4 right-4 text-primary/10">
                    <Quote className="w-10 h-10" />
                  </div>
                  
                  <p className="text-gray-700 mb-4 relative z-10">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="text-sm text-primary font-medium">
                    Purchased: {testimonial.product}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center justify-center bg-primary/10 rounded-full px-6 py-2 text-primary text-sm font-medium">
            <Star className="h-4 w-4 mr-2 fill-primary" />
            4.9 average rating from over 2,000 reviews
          </div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered the beauty of authentic craftsmanship
          </p>
          <button className="mt-6 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full transition-colors">
            Shop Our Collections
          </button>
        </motion.div>
      </div>
      
      {/* Custom styles for hiding scrollbar but allowing scroll */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
