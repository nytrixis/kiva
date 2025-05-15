"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Upload, Film, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  images: any;
}

interface ReelUploadProps {
  products: Product[];
  onClose: () => void;
}

export default function ReelUpload({ products, onClose }: ReelUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a video smaller than 100MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create video preview
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };
  
  // Trigger file input click
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "No video selected",
        description: "Please select a video to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append("caption", caption);
      
      if (selectedProductId) {
        formData.append("productId", selectedProductId);
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
      
      // Upload reel
      const response = await fetch("/api/reels", {
        method: "POST",
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error("Failed to upload reel");
      }
      
      setUploadProgress(100);
      
      toast({
        title: "Reel uploaded",
        description: "Your reel has been uploaded successfully",
        variant: "success",
      });
      
      // Refresh reels page
      router.refresh();
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error uploading reel:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload reel. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">Upload Reel</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {!videoPreview ? (
            <div
              onClick={handleSelectFile}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Film className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to select a video</p>
              <p className="text-xs text-gray-500">
                MP4, MOV or WebM format, max 100MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="mb-4">
              <div className="relative aspect-[9/16] w-full bg-black rounded-lg overflow-hidden">
                <video
                  src={videoPreview}
                  className="h-full w-full object-contain"
                  controls
                  muted
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectFile}
                  disabled={isUploading}
                >
                  Change Video
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption to your reel..."
                className="mt-1"
                maxLength={500}
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {caption.length}/500 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="product">Link to Product (Optional)</Label>
              <select
                id="product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary mt-1"
                disabled={isUploading}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {uploadProgress === 100 ? (
                  <span className="text-green-500 flex items-center justify-center">
                    Upload complete <Check className="h-3 w-3 ml-1" />
                  </span>
                ) : (
                  `Uploading: ${uploadProgress}%`
                )}
              </p>
            </div>
          )}
        </form>
        
        <div className="p-4 border-t">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isUploading ? "Uploading..." : "Upload Reel"}
          </Button>
        </div>
      </div>
    </div>
  );
}
