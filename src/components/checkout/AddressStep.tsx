"use client";

import { useState, useEffect } from "react";
import { useCheckout } from "@/contexts/checkout-context";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin, Check, Home, Building, Edit, Trash } from "lucide-react";
import AddressForm from "./AddressForm";

export interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressStep({ addresses }: { addresses: Address[] }) {
  const { selectedAddressId, setSelectedAddressId, setStep, isLoading } = useCheckout();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  // Set default address as selected if available and none is selected
  useEffect(() => {
  if (!selectedAddressId && addresses.length > 0) {
    const defaultAddress = addresses.find(addr => addr.isDefault);
    setSelectedAddressId(defaultAddress?.id || addresses[0].id);
  }
}, [addresses, selectedAddressId, setSelectedAddressId]);
  
  const handleContinue = () => {
    if (selectedAddressId) {
      setStep(2);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">Shipping Address</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowAddForm(true);
            setEditingAddressId(null);
          }}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>
      
      {showAddForm && (
        <div className="bg-accent/10 rounded-lg p-4">
          <AddressForm
            existingAddress={editingAddressId ? addresses.find(a => a.id === editingAddressId) : undefined}
            onCancel={() => {
              setShowAddForm(false);
              setEditingAddressId(null);
            }}
            onSuccess={(newAddress) => {
              setShowAddForm(false);
              setEditingAddressId(null);
              setSelectedAddressId(newAddress.id);
            }}
          />
        </div>
      )}
      
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedAddressId === address.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedAddressId(address.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {address.isDefault ? (
                      <Home className="h-5 w-5 text-primary" />
                    ) : (
                      <Building className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900">{address.name}</p>
                      {address.isDefault && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {address.line1}
                      {address.line2 && `, ${address.line2}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-500">{address.country}</p>
                    <p className="text-sm text-gray-500 mt-1">{address.phone}</p>
                  </div>
                </div>
                
                {selectedAddressId === address.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAddressId(address.id);
                        setShowAddForm(true);
                      }}
                      className="text-gray-400 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {selectedAddressId === address.id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !showAddForm ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
          <p className="text-gray-500 mb-4">Please add a shipping address to continue</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            Add Address
          </Button>
        </div>
      ) : null}
      
      {addresses.length > 0 && !showAddForm && (
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleContinue}
            disabled={!selectedAddressId || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            Continue to Review
          </Button>
        </div>
      )}
    </div>
  );
}
