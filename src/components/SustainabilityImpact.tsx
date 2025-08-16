"use client";

import { motion } from "framer-motion";
import { Rocket, Target, Users, Lightbulb, TrendingUp, Heart } from "lucide-react";

const startupGoals = [
  {
    icon: Rocket,
    title: "Launch Bold Ideas",
    description: "We're building a platform that empowers local creators and brings their unique products to the world.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Target,
    title: "Aim for Impact",
    description: "Our mission is to make authentic craftsmanship accessible, supporting artisans and delighting customers.",
    color: "bg-accent/10 text-accent"
  },
  {
    icon: Users,
    title: "Grow Our Community",
    description: "We believe in the power of community—connecting makers, shoppers, and supporters in one vibrant ecosystem.",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: Lightbulb,
    title: "Innovate Together",
    description: "We're experimenting, learning, and iterating fast. Every feedback helps us shape the future of digital commerce.",
    color: "bg-yellow-50 text-yellow-600"
  },
  {
    icon: TrendingUp,
    title: "Scale With Purpose",
    description: "Our goal: 10,000+ artisans and 1 million happy customers by 2026. Join us on this journey!",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: Heart,
    title: "Built With Passion",
    description: "We're a small team with big dreams, driven by creativity, empathy, and a love for handcrafted stories.",
    color: "bg-red-50 text-red-600"
  }
];

export default function StartupVision() {
  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-primary/5 rounded-br-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-1/4 h-1/3 bg-accent/10 rounded-tl-[80px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section heading with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-5xl text-foreground mb-4">
            Our <span className="text-primary">Startup Vision</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We’re on a mission to redefine how India discovers, shops, and celebrates local creativity. Here’s what drives us:
          </p>
        </motion.div>

        {/* Startup goals grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: { duration: 0.5 }
          }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {startupGoals.map((goal, index) => (
            <motion.div
              key={goal.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, delay: index * 0.1 }
              }}
              viewport={{ once: true }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-6 flex flex-col items-start">
                <div className={`p-3 rounded-full mb-4 ${goal.color}`}>
                  <goal.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-xl text-foreground mb-2">{goal.title}</h3>
                <p className="text-gray-700">{goal.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Vision statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-accent/30 rounded-2xl p-6 md:p-10 max-w-4xl mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl text-foreground mb-4">
              Why We’re Building Ajyaa
            </h3>
            <p className="text-gray-700 mb-6">
              We believe every artisan deserves a stage, every shopper deserves a story, and every product should spark joy. We’re just getting started—help us shape the future!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary">
                🚀 Fast-growing team
              </span>
              <span className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary">
                💡 Always experimenting
              </span>
              <span className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-primary">
                ❤️ Community-first
              </span>
            </div>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <a
            href="/about"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full transition-colors"
          >
            <Rocket className="h-5 w-5" />
            Join Our Journey
          </a>
          <p className="mt-3 text-sm text-gray-500">
            Be part of something new. Your feedback and support matter!
          </p>
        </motion.div>
      </div>
    </section>
  );
}