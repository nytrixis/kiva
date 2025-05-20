"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Gift, Send, Star, ArrowRight, Sparkles, Smile } from "lucide-react";

export default function InfluencerProgramPage() {
  return (
    <div className="bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 rounded-bl-[100px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-accent/10 rounded-tr-[80px] -z-10"></div>
        {/* Floating elements */}
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
                Become a <span className="relative">
                  Kiva Influencer
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-accent"></span>
                </span>
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Share your passion, inspire your audience, and earn with every story you tell.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-56 md:h-80 rounded-2xl overflow-hidden shadow-xl my-12"
            >
              <Image
                src="/images/influencer-hero.png"
                alt="Kiva Influencer Program"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <p className="font-heading text-xl md:text-2xl">
                    Empowering creators, one story at a time
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
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
              How It Works
            </h2>
            <p className="text-gray-700">
              Join our program in three simple steps and start earning!
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <User className="h-10 w-10 text-primary" />,
                title: "Apply",
                desc: "Fill out our quick application and tell us about your audience."
              },
              {
                icon: <Send className="h-10 w-10 text-primary" />,
                title: "Share",
                desc: "Get your unique link and share Kiva products with your followers."
              },
              {
                icon: <Gift className="h-10 w-10 text-primary" />,
                title: "Earn",
                desc: "Earn commissions and rewards for every successful referral."
              }
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-accent/10 rounded-xl p-8 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-heading text-xl text-primary mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Why Join the Kiva Influencer Program?
            </h2>
            <p className="text-gray-700">
              Enjoy exclusive perks, community, and real rewards for your creativity.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              {
                icon: <Star className="h-8 w-8 text-amber-500" />,
                title: "Attractive Commissions",
                desc: "Earn up to 15% on every sale made through your link."
              },
              {
                icon: <Gift className="h-8 w-8 text-green-500" />,
                title: "Exclusive Gifts",
                desc: "Get special gifts and early access to new collections."
              },
              {
                icon: <Sparkles className="h-8 w-8 text-blue-500" />,
                title: "Community & Features",
                desc: "Get featured on Kiva’s socials and join a vibrant creator community."
              },
              {
                icon: <Send className="h-8 w-8 text-purple-500" />,
                title: "Easy Payouts",
                desc: "Monthly payouts via your preferred payment method."
              }
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-heading text-lg text-primary mb-1">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature/Testimonial Section */}
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
                Real Stories, Real Impact
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Our influencers are storytellers, creators, and changemakers. By joining Kiva, you help artisans reach new audiences and inspire your followers to shop consciously.
                </p>
                <p>
                  Whether you’re a micro-influencer or have a large following, your voice matters. We support you with resources, features, and a community that celebrates your creativity.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/influencer-program/apply"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Apply Now <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative w-full pb-[100%] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/influencer-feature.png"
                  alt="Influencer at work"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <p className="text-gray-700 text-sm italic">
                  “Kiva helped me turn my passion into purpose. The community is amazing and the rewards are real!”
                </p>
                <p className="text-right text-primary font-medium mt-2">— A Kiva Influencer</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
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
              Frequently Asked Questions
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {[
              {
                q: "Who can join the Kiva Influencer Program?",
                a: "Anyone with an engaged audience on social media, a blog, or YouTube can apply. We welcome creators from all backgrounds!"
              },
              {
                q: "How do I get paid?",
                a: "You’ll receive monthly payouts via your chosen payment method, once you reach the minimum payout threshold."
              },
              {
                q: "How will I track my referrals?",
                a: "You’ll get access to a dashboard to track clicks, sales, and commissions in real time."
              },
              {
                q: "How do I apply?",
                a: "Click the “Apply Now” button above and fill out the application form. Our team will review your application and get back to you soon!"
              }
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
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
              Ready to Join?
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              Become a Kiva Influencer and start making an impact today.
            </p>
            <Link
              href="/influencer-program/apply"
              className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
            >
              Apply Now
            </Link>
            <div className="mt-12 flex items-center justify-center space-x-2">
              <Smile className="h-5 w-5 text-primary" />
              <p className="text-gray-700">
                We can’t wait to welcome you to the Kiva family!
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