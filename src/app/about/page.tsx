"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signIn, useSession } from "next-auth/react";
import { 
  Heart, 
  Sparkles, 
  Users, 
  ShoppingBag, 
  Gem, 
  Award, 
  Globe, 
  Lightbulb,
  Smile,
  ArrowRight
} from "lucide-react";

// export const metadata: Metadata = {
//   title: "About Us | Kiva",
//   description: "Learn about Kiva's mission to connect artisans with customers and our journey from a college project to a thriving marketplace.",
// };

export default function AboutPage() {
  const router = useRouter();
const { toast } = useToast();
const { data: session, status } = useSession();

const handleSellerClick = async (e: React.MouseEvent) => {
  e.preventDefault();

  // 1. Not signed in
  if (status === "unauthenticated" || !session?.user) {
    toast({
      title: "Please sign in to continue",
      variant: "info",
    });
    signIn(); // Opens the sign-in modal
    return;
  }

  // 2. Signed in, but not a seller
  // Assume user role is stored as session.user.role ("customer" or "seller")
  if (session.user.role !== "seller") {
    toast({
      title: "You need to have a seller account",
      variant: "destructive",
    });
    return;
  }

  // 3. Signed in and is a seller
  router.push("/dashboard/seller");
};
  return (
    <div className="bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 rounded-bl-[100px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-accent/10 rounded-tr-[80px] -z-10"></div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-[10%] w-8 h-8 rounded-full bg-accent/40 animate-float-slow -z-10"></div>
        <div className="absolute top-40 right-[15%] w-6 h-6 rounded-full bg-primary/30 animate-float -z-10"></div>
        <div className="absolute bottom-20 left-[20%] w-10 h-10 rounded-full bg-primary/20 animate-float-slow -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-heading text-4xl md:text-6xl text-primary mb-6">
                Our <span className="relative">
                  Story
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent"></span>
                </span>
              </h1>
              
              <p className="text-lg text-gray-700 mb-8">
                Welcome to Kiva, a platform born from a passion for connecting artisans with customers who appreciate the beauty of handcrafted goods.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl my-12"
            >
              <Image
                src="/images/about-hero.png"
                alt="Kiva Marketplace"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1000px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <p className="font-heading text-xl md:text-2xl">
                    Connecting artisans with the world
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-3xl md:text-4xl text-primary mb-6">
                From College Project to Marketplace
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  Kiva began as a college project by two passionate students, Nandini and Meraj, who shared a vision of creating a platform that celebrates craftsmanship and cultural heritage.
                </p>
                <p>
                  What started as a simple idea in a dorm room has evolved into a vibrant marketplace connecting talented artisans with customers who value authenticity and quality.
                </p>
                <p>
                  Our journey has been guided by a simple belief: that beautiful, handcrafted products deserve to be discovered, and the stories behind them deserve to be told.
                </p>
              </div>
              
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex flex-col items-center">
                  <div className="text-primary font-bold text-3xl">2025</div>
                  <div className="text-sm text-gray-500">Founded</div>
                </div>
                
                <div className="h-12 border-l border-gray-200"></div>
                
                <div className="flex flex-col items-center">
                  <div className="text-primary font-bold text-3xl">100+</div>
                  <div className="text-sm text-gray-500">Artisans</div>
                </div>
                
                <div className="h-12 border-l border-gray-200"></div>
                
                <div className="flex flex-col items-center">
                  <div className="text-primary font-bold text-3xl">1000+</div>
                  <div className="text-sm text-gray-500">Products</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="relative w-full pb-[50%] rounded-tl-3xl rounded-br-3xl overflow-hidden shadow-lg">
                    <Image
                        src="/images/founders.png"
                        alt="Founders of Kiva"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 500px"
                    />
                    </div>

                
                <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                  <p className="text-gray-700 text-sm italic">
                    We created Kiva to celebrate the beauty of handcrafted goods and the stories behind them.
                  </p>
                  <p className="text-right text-primary font-medium mt-2">— Nandini & Meraj</p>
                </div>
              </div>
              
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/30 rounded-full -z-10"></div>
              <div className="absolute -bottom-10 right-20 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-16 bg-accent/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4">
              Our Mission
            </h2>
            <p className="text-gray-700">
              At Kiva, we are on a mission to transform how people discover and shop for unique, handcrafted products.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8 text-primary" />,
                title: "Support Artisans",
                description: "We help talented creators share their craft with the world and earn a fair income for their work."
              },
              {
                icon: <Globe className="h-8 w-8 text-primary" />,
                title: "Preserve Heritage",
                description: "We celebrate cultural traditions and help preserve age-old crafting techniques for future generations."
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: "Build Community",
                description: "We foster connections between makers and buyers who share a passion for authentic, quality goods."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  {item.icon}
                </div>
                <h3 className="font-heading text-xl text-primary text-center mb-3">{item.title}</h3>
                <p className="text-gray-700 text-center">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Who is Kiva For? */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4">
              Who is Kiva For?
            </h2>
            <p className="text-gray-700">
              Our platform brings together a community of creators and shoppers who value quality, authenticity, and connection.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-accent/20 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/30 rounded-bl-full -z-10"></div>
              
              <h3 className="font-heading text-2xl text-primary mb-4 flex items-center">
                <Gem className="h-6 w-6 mr-2" />
                For Artisans & Sellers
              </h3>
              
              <ul className="space-y-4">
                {[
                  "Independent craftspeople looking to reach new customers",
                  "Small businesses with unique, quality products",
                  "Cultural artisans preserving traditional techniques",
                  "Creators seeking a supportive community"
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-start"
                  >
                    <span className="bg-white rounded-full p-1 mr-3 mt-0.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleSellerClick}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                >
                  Start selling on Kiva
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-primary/10 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-br-full -z-10"></div>
              
              <h3 className="font-heading text-2xl text-primary mb-4 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" />
                For Shoppers & Customers
              </h3>
              
              <ul className="space-y-4">
                {[
                  "Conscious consumers who value quality over mass production",
                  "Gift-givers searching for meaningful, unique presents",
                  "Design enthusiasts with an eye for craftsmanship",
                  "Anyone who appreciates the story behind their purchases"
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-start"
                  >
                    <span className="bg-white rounded-full p-1 mr-3 mt-0.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </span>
                                        <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Link 
                  href="/marketplace"
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                >
                  Explore our marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-16 bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4">
              Our Values
            </h2>
            <p className="text-gray-700">
              These core principles guide everything we do at Kiva
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Award className="h-10 w-10 text-primary" />,
                title: "Quality",
                description: "We celebrate craftsmanship and attention to detail in every product."
              },
              {
                icon: <Heart className="h-10 w-10 text-primary" />,
                title: "Authenticity",
                description: "We value genuine stories, honest materials, and transparent practices."
              },
              {
                icon: <Lightbulb className="h-10 w-10 text-primary" />,
                title: "Creativity",
                description: "We foster innovation while honoring traditional techniques."
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Community",
                description: "We build meaningful connections between creators and customers."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/30 mb-4">
                  {value.icon}
                </div>
                <h3 className="font-heading text-xl text-primary mb-2">{value.title}</h3>
                <p className="text-gray-700">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Meet the Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-4">
              Meet the Founders
            </h2>
            <p className="text-gray-700">
              The creative minds behind Kiva
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {[
              {
                name: "Nandini",
                role: "Co-Founder & Tech Lead",
                image: "/images/nandini.png",
                bio: "With a background in technology and a love for traditional crafts, Nandini bridges the gap between artisanal heritage and digital innovation. She's committed to creating a platform that empowers creators.",
                quote: "Technology should serve humanity by preserving what makes us human: our creativity and culture."
              },
              {
                name: "Meraj",
                role: "Co-Founder & Creative Director",
                image: "/images/meraj.png",
                bio: "A design enthusiast with a passion for cultural heritage, Meraj brings his creative vision and eye for aesthetics to Kiva. He believes in the power of storytelling through craftsmanship.",
                quote: "Beautiful things don't ask for attention, they simply deserve to be discovered."
              }
            ].map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="font-heading text-2xl">{founder.name}</h3>
                      <p className="text-white/80">{founder.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-700 mb-4">{founder.bio}</p>
                  <blockquote className="italic text-primary border-l-4 border-primary pl-4 py-2">
                    {founder.quote}
                  </blockquote>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Join Our Journey */}
      <section className="py-16 bg-primary/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border-8 border-primary"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border-8 border-accent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-8 border-primary/50"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-primary mb-6">
              Join Our Journey
            </h2>
            
            <p className="text-lg text-gray-700 mb-8">
              Kiva is more than a marketplace—it is a community of creators and customers who believe in the value of handcrafted goods and the stories behind them.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/marketplace"
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              >
                Explore Products
              </Link>
              
              <button
                  type="button"
                  onClick={handleSellerClick}
                  className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                >
                  Start selling on Kiva
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-2">
              <Smile className="h-5 w-5 text-primary" />
              <p className="text-gray-700">
                Made with love in India
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

