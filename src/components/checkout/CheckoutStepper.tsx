"use client";

import { useCheckout } from "@/contexts/checkout-context";
import { MapPin, ShoppingBag, CreditCard, Check } from "lucide-react";

export default function CheckoutStepper() {
  const { step } = useCheckout();
  
  const steps = [
    { id: 1, name: "Shipping", icon: <MapPin className="h-5 w-5" /> },
    { id: 2, name: "Review", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: 3, name: "Payment", icon: <CreditCard className="h-5 w-5" /> },
  ];
  
  return (
    <div className="flex items-center justify-between">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          {/* Step circle */}
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= s.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {step > s.id ? <Check className="h-5 w-5" /> : s.icon}
          </div>
          
          {/* Step name */}
          <div className="ml-3">
            <p
              className={`text-sm font-medium ${
                step >= s.id ? "text-primary" : "text-gray-500"
              }`}
            >
              {s.name}
            </p>
          </div>
          
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${
                step > i + 1 ? "bg-primary" : "bg-gray-200"
              }`}
              style={{ width: "60px" }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}
