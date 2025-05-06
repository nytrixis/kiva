"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Loader2, Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { UserRole } from "@prisma/client";

// Define types based on Prisma schema
interface UserPreferences {
  categories: string[];
  notifications: boolean;
  location: string;
}

interface OnboardingData {
  preferences: UserPreferences;
  role: UserRole;
}

export default function CustomerOnboardingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    notifications: true,
    location: "",
  });

  // Redirect if not authenticated
  if (!isLoading && !user) {
    router.push("/sign-in");
    return null;
  }

  // Categories for selection
  const categories = [
    { id: "jewelry", name: "Handcrafted Jewelry" },
    { id: "home-decor", name: "Home Decor" },
    { id: "fashion", name: "Sustainable Fashion" },
    { id: "wellness", name: "Wellness & Beauty" },
    { id: "foods", name: "Artisanal Foods" },
    { id: "crafts", name: "Traditional Crafts" },
    { id: "art", name: "Fine Art" },
    { id: "textiles", name: "Textiles" },
  ];

  // Toggle category selection
  const toggleCategory = (categoryId: string) => {
    setPreferences(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return { ...prev, categories: newCategories };
    });
  };

  // Handle location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreferences(prev => ({ ...prev, location: e.target.value }));
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setPreferences(prev => ({ ...prev, notifications: !prev.notifications }));
  };

  // Handle next step
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  // Handle previous step
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    setIsSubmitting(true);
    
    try {
      // Save preferences to user profile
      const onboardingData: OnboardingData = {
        preferences,
        role: "CUSTOMER" as UserRole,
      };

      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(onboardingData),
      });
      
      if (response.ok) {
        // Redirect to dashboard or home page
        router.push("/dashboard");
        router.refresh();
      } else {
        console.error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error during onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress indicator */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden border border-[#E6E6FA]">
                <Image
                  src="/images/logob.png"
                  alt="Kiva Logo"
                  fill
                  className="object-cover"
                  sizes="40px"
                  priority
                />
              </div>
            </Link>
            
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-1 rounded-full ${
                    step === currentStep
                      ? 'bg-primary'
                      : step < currentStep
                        ? 'bg-primary/50'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                Welcome to Kiva, {user?.name}!
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Let's personalize your experience to help you discover unique local products you'll love.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-medium mb-6">Select categories that interest you</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      preferences.categories.includes(category.id)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {preferences.categories.includes(category.id) && (
                      <Check className="h-4 w-4 mx-auto mb-2" />
                    )}
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={nextStep}
                disabled={preferences.categories.length === 0}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4 inline" />
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Step 2: Location */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                Where are you located?
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                This helps us show you products and artisans in your area.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="space-y-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Your location
                </label>
                <input
                  type="text"
                  id="location"
                  value={preferences.location}
                  onChange={handleLocationChange}
                  placeholder="City, State or Zip Code"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-sm text-gray-500">
                  We'll use this to show you local artisans and events near you.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={nextStep}
                disabled={!preferences.location}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4 inline" />
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Step 3: Notifications and Finish */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
                Almost done!
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Just a few more preferences to complete your profile.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-gray-500">
                      Receive updates about new products and local events
                    </p>
                  </div>
                  
                  <button
                    onClick={toggleNotifications}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferences.notifications ? 'bg-primary' : 'bg-gray-300'
                    } relative`}
                  >
                    <span
                      className={`absolute top-1 ${
                        preferences.notifications ? 'right-1' : 'left-1'
                      } w-4 h-4 rounded-full bg-white transition-all`}
                    />
                  </button>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium mb-4">Your selected preferences:</h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Categories:</span>{" "}
                      {preferences.categories.length > 0
                        ? preferences.categories.map(id =>
                            categories.find(c => c.id === id)?.name
                          ).join(", ")
                        : "None selected"}
                    </p>
                    
                    <p className="text-sm">
                      <span className="font-medium">Location:</span>{" "}
                      {preferences.location || "Not specified"}
                    </p>
                    
                    <p className="text-sm">
                      <span className="font-medium">Notifications:</span>{" "}
                      {preferences.notifications ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={completeOnboarding}
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </span>
                ) : (
                  "Complete Setup"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
