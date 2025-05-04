"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Droplet, Recycle, Users, TreeDeciduous, Truck } from "lucide-react";

// Impact metrics data
const impactMetrics = [
  {
    id: 1,
    title: "Water Saved",
    value: 2850000,
    unit: "Liters",
    icon: Droplet,
    color: "bg-blue-50 text-blue-500",
    description: "Through sustainable production practices",
    increment: 120
  },
  {
    id: 2,
    title: "CO₂ Reduced",
    value: 156,
    unit: "Tons",
    icon: Leaf,
    color: "bg-green-50 text-green-500",
    description: "By supporting local artisans and reducing transportation",
    increment: 0.01
  },
  {
    id: 3,
    title: "Waste Recycled",
    value: 8700,
    unit: "Kg",
    icon: Recycle,
    color: "bg-amber-50 text-amber-500",
    description: "Materials repurposed into beautiful products",
    increment: 0.5
  },
  {
    id: 4,
    title: "Artisans Supported",
    value: 1240,
    unit: "Families",
    icon: Users,
    color: "bg-purple-50 text-purple-500",
    description: "Direct positive impact on local communities",
    increment: 0.02
  },
  {
    id: 5,
    title: "Trees Planted",
    value: 12500,
    unit: "Trees",
    icon: TreeDeciduous,
    color: "bg-emerald-50 text-emerald-500",
    description: "Through our reforestation initiative",
    increment: 0.8
  },
  {
    id: 6,
    title: "Miles Saved",
    value: 45600,
    unit: "Miles",
    icon: Truck,
    color: "bg-indigo-50 text-indigo-500",
    description: "By sourcing locally and reducing shipping distances",
    increment: 2
  }
];

export default function SustainabilityImpact() {
  const [metrics, setMetrics] = useState(impactMetrics);
  const [isVisible, setIsVisible] = useState(false);

  // Animate the metrics when they come into view
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setMetrics(currentMetrics => 
          currentMetrics.map(metric => ({
            ...metric,
            value: metric.value + metric.increment
          }))
        );
      }, 100);
      
      // Clear interval after some time to prevent endless incrementing
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 3000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible]);

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-primary/5 rounded-br-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/3 bg-accent/10 rounded-tl-[80px]"></div>
      
      {/* Subtle leaf pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 transform -rotate-15">
          <Leaf className="w-24 h-24 text-primary" />
        </div>
        <div className="absolute bottom-10 right-10 transform rotate-15">
          <Leaf className="w-24 h-24 text-primary" />
        </div>
        <div className="absolute top-1/3 right-1/4 transform rotate-45">
          <Leaf className="w-16 h-16 text-primary" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 transform -rotate-30">
          <Leaf className="w-16 h-16 text-primary" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section heading with animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Our <span className="text-primary">Sustainability</span> Impact
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Together with our artisans and customers, we're making a measurable difference for our planet and communities
          </p>
        </motion.div>
        
        {/* Impact metrics grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ 
            opacity: 1,
            transition: { duration: 0.5 }
          }}
          viewport={{ once: true, margin: "-100px" }}
          onViewportEnter={() => setIsVisible(true)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, delay: index * 0.1 }
              }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-xl text-foreground">{metric.title}</h3>
                    <p className="text-sm text-gray-500">{metric.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.color}`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="font-heading text-3xl md:text-4xl font-bold text-primary">
                      {metric.value.toLocaleString(undefined, { 
                        maximumFractionDigits: 0 
                      })}
                    </span>
                    <span className="ml-2 text-gray-500">{metric.unit}</span>
                  </div>
                  
                  {/* Progress visualization */}
                  <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ 
                        width: "100%",
                        transition: { duration: 2, ease: "easeOut" }
                      }}
                      viewport={{ once: true }}
                      className={`h-full rounded-full ${metric.color.split(' ')[0].replace('bg-', 'bg-')}`}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Sustainability commitment statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-accent/30 rounded-2xl p-6 md:p-10 max-w-4xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-4">
              Our Commitment to Sustainability
            </h3>
            <p className="text-gray-700 mb-6">
              Every purchase you make contributes to these positive impacts. We work directly with artisans who use sustainable materials and traditional techniques that are environmentally friendly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary">
                <Recycle className="h-4 w-4 mr-2" />
                Eco-friendly Materials
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary">
                <Users className="h-4 w-4 mr-2" />
                Fair Trade Practices
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary">
                <Truck className="h-4 w-4 mr-2" />
                Carbon-neutral Shipping
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Interactive element - Sustainability pledge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full transition-colors">
            <Leaf className="h-5 w-5" />
            Join Our Sustainability Pledge
          </button>
          <p className="mt-3 text-sm text-gray-500">
            Learn how you can amplify your positive impact
          </p>
        </motion.div>
      </div>
    </section>
  );
}
