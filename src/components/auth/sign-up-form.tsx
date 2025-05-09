"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { UserRole } from "@/lib/constants";

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  role: z.enum([UserRole.CUSTOMER, UserRole.SELLER, UserRole.INFLUENCER]),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.CUSTOMER,
    },
  });
  
  const password = watch("password");
  
  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Sign in the user after successful registration
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      // Redirect to onboarding based on role
      router.push(`/onboarding/${data.role.toLowerCase()}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Password strength indicators
  const hasMinLength = password?.length >= 8;
  const hasUppercase = /[A-Z]/.test(password || "");
  const hasLowercase = /[a-z]/.test(password || "");
  const hasNumber = /[0-9]/.test(password || "");
  
  return (
    <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-xl shadow-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground font-heading">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Join Kiva to discover unique local brands
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="Nandini Pandey"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            placeholder="you@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Password strength indicators */}
          {password && (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-gray-600 font-medium">Password requirements:</div>
              <ul className="space-y-1 text-xs">
                <li className="flex items-center">
                  <span className={`mr-2 ${hasMinLength ? 'text-green-500' : 'text-gray-400'}`}>
                    {hasMinLength ? <Check className="h-3 w-3" /> : "•"}
                  </span>
                  <span className={hasMinLength ? 'text-green-700' : 'text-gray-600'}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${hasUppercase ? 'text-green-500' : 'text-gray-400'}`}>
                    {hasUppercase ? <Check className="h-3 w-3" /> : "•"}
                  </span>
                  <span className={hasUppercase ? 'text-green-700' : 'text-gray-600'}>
                    At least one uppercase letter
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${hasLowercase ? 'text-green-500' : 'text-gray-400'}`}>
                    {hasLowercase ? <Check className="h-3 w-3" /> : "•"}
                  </span>
                  <span className={hasLowercase ? 'text-green-700' : 'text-gray-600'}>
                    At least one lowercase letter
                  </span>
                </li>
                <li className="flex items-center">
                  <span className={`mr-2 ${hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                    {hasNumber ? <Check className="h-3 w-3" /> : "•"}
                  </span>
                  <span className={hasNumber ? 'text-green-700' : 'text-gray-600'}>
                    At least one number
                  </span>
                </li>
              </ul>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-gray-700">
            I want to join as a
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="relative">
              <input
                type="radio"
                value={UserRole.CUSTOMER}
                {...register("role")}
                className="sr-only"
              />
              <div className={`
                cursor-pointer px-4 py-3 border rounded-lg text-center text-sm transition-all
                ${watch("role") === UserRole.CUSTOMER 
                  ? 'border-primary bg-primary/5 text-primary font-medium' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'}
              `}>
                Customer
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                value={UserRole.SELLER}
                {...register("role")}
                className="sr-only"
              />
              <div className={`
                cursor-pointer px-4 py-3 border rounded-lg text-center text-sm transition-all
                ${watch("role") === UserRole.SELLER 
                  ? 'border-primary bg-primary/5 text-primary font-medium' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'}
              `}>
                Seller
              </div>
            </label>
            <label className="relative">
              <input
                type="radio"
                value={UserRole.INFLUENCER}
                {...register("role")}
                className="sr-only"
              />
              <div className={`
                cursor-pointer px-4 py-3 border rounded-lg text-center text-sm transition-all
                ${watch("role") === UserRole.INFLUENCER 
                  ? 'border-primary bg-primary/5 text-primary font-medium' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'}
              `}>
                Influencer
              </div>
            </label>
          </div>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:text-primary/80 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </Link>
          .
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
        
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 w-full"></div>
          <span className="bg-white px-2 text-sm text-gray-500 absolute">or</span>
        </div>
        
        {/* Social signup buttons can be added here later */}
        
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link 
            href="/sign-in" 
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
