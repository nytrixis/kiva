"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function CategoryImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/admin/categories/upload", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to upload image");
      }
      
      setUploadedUrl(result.url);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-heading text-primary mb-6">Upload Category Banner</h1>
      
      <form onSubmit={handleUpload} className="max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Banner Image (Recommended: 1920×384px)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        
        <button
          type="submit"
          disabled={isUploading || !file}
          className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>
      </form>
      
      {uploadedUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Uploaded Image URL:</h2>
          <div className="bg-gray-100 p-3 rounded-md break-all">
            <p className="text-sm font-mono">{uploadedUrl}</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Copy this URL and add it to the category in Prisma Studio
          </p>
          
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Preview:</h3>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <Image src={uploadedUrl} alt="Uploaded banner" className="w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
