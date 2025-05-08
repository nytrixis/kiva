"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function KYCDocumentUpload() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [businessDocument, setBusinessDocument] = useState<File | null>(null);
  const [currentDocuments, setCurrentDocuments] = useState<{
    identityDocument?: string;
    businessDocument?: string;
    status?: string;
  }>({});
  
  useEffect(() => {
    // Fetch current KYC documents if any
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/seller/kyc");
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentDocuments(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching KYC documents:", error);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identityDocument && !businessDocument) {
      toast({
        title: "Error",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      if (identityDocument) {
        formData.append("identityDocument", identityDocument);
      }
      
      if (businessDocument) {
        formData.append("businessDocument", businessDocument);
      }
      
      const response = await fetch("/api/seller/kyc", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to upload documents");
      }
      
      toast({
        title: "Success",
        description: "Documents uploaded successfully!",
        variant: "success",
      });
      router.push("/dashboard/seller");
    } catch (error) {
      console.error("Error uploading KYC documents:", error);
      toast({
        title: "Error",
        description: "Failed to upload documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusAlert = () => {
    if (!currentDocuments.status) return null;
    
    switch (currentDocuments.status) {
      case "PENDING":
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Under Review</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your documents are being reviewed by our team.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "APPROVED":
        return (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Approved</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your seller account has been verified.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "REJECTED":
        return (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Rejected</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Your verification was rejected. Please upload new documents.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-heading text-primary">KYC Verification</h1>
        <p className="text-sm text-gray-500">
          Upload your identity and business documents for verification
        </p>
      </div>
      
      {getStatusAlert()}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Identity Verification</h3>
          <div className="h-px bg-muted w-full"></div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Identity Document (Government ID, Passport, Driver's License)
            </label>
            
            {currentDocuments.identityDocument ? (
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-32 border rounded overflow-hidden">
                  <Image 
                    src={currentDocuments.identityDocument}
                    alt="Identity Document"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Document uploaded</p>
                  <button
                    type="button"
                    onClick={() => setIdentityDocument(null)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                <div className="flex flex-col items-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label htmlFor="identity-document" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90">
                      <span>Upload a file</span>
                      <input 
                        id="identity-document" 
                        name="identity-document" 
                        type="file" 
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setIdentityDocument(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            )}
            
            {identityDocument && !currentDocuments.identityDocument && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Selected file: {identityDocument.name}</p>
                <button
                  type="button"
                  onClick={() => setIdentityDocument(null)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">Business Verification</h3>
          <div className="h-px bg-muted w-full"></div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Business Document (Business License, Registration Certificate)
            </label>
            
            {currentDocuments.businessDocument ? (
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-32 border rounded overflow-hidden">
                  <Image 
                    src={currentDocuments.businessDocument}
                    alt="Business Document"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Document uploaded</p>
                  <button
                    type="button"
                    onClick={() => setBusinessDocument(null)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                <div className="flex flex-col items-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label htmlFor="business-document" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90">
                      <span>Upload a file</span>
                      <input 
                        id="business-document" 
                        name="business-document" 
                        type="file" 
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setBusinessDocument(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            )}
            
            {businessDocument && !currentDocuments.businessDocument && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Selected file: {businessDocument.name}</p>
                <button
                  type="button"
                  onClick={() => setBusinessDocument(null)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-4">
        <button
            type="submit"
            disabled={
                isSubmitting || 
                (currentDocuments.status === "PENDING" && 
                Boolean(currentDocuments.identityDocument) && 
                Boolean(currentDocuments.businessDocument))
            }
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isSubmitting ? "Uploading..." : "Submit Documents for Verification"}
            </button>

          
          {currentDocuments.status === "PENDING" && currentDocuments.identityDocument && currentDocuments.businessDocument && (
            <p className="mt-2 text-sm text-center text-gray-500">
              Your documents are currently under review. You'll be notified once the verification is complete.
            </p>
          )}
        </div>
      </form>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">Important Notes:</h3>
        <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
          <li>All documents must be clear, legible, and unaltered</li>
          <li>Documents in languages other than English should include a translation</li>
          <li>Verification typically takes 1-3 business days</li>
          <li>Your information is securely stored and handled according to our privacy policy</li>
        </ul>
      </div>
    </div>
  );
}
