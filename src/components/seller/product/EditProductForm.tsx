"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Check, Loader2, ArrowLeft, ArrowRight, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// Form steps
const STEPS = {
  BASIC_INFO: 0,
  PRICING: 1,
  IMAGES: 2,
  INVENTORY: 3,
  REVIEW: 4,
};

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  images: string[];
  categoryId: string;
}

interface EditProductFormProps {
  product: Product;
  categories: Category[];
}

export default function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC_INFO);
  
  // Form state
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    price: product.price,
    discountPercentage: product.discountPercentage,
    stock: product.stock,
    images: product.images,
    newImages: [] as File[],
    newImageUrls: [] as string[], // For preview of new images
    removedImages: [] as string[], // Track removed images
  });
  
  // Form validation state
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    images: "",
    stock: "",
    submit: "",
  });
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is edited
    if (name in errors && errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  
  // Handle numeric input changes
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue,
      }));
      
      // Clear error when field is edited
      if (name in errors && errors[name as keyof typeof errors]) {
        setErrors(prev => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };
  
  // Handle image uploads
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check file size and type for each file
    const validFiles = Array.from(files).filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        images: "Some files were rejected. Images must be JPG, PNG, or WebP and less than 5MB."
      }));
    }
    
    // Create temporary URLs for preview
    const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
    
    // Add to form data
    setFormData(prev => ({
      ...prev,
      newImageUrls: [...prev.newImageUrls, ...newImageUrls],
      newImages: [...prev.newImages, ...validFiles]
    }));
  };
  
  // Remove an existing image
  const handleRemoveExistingImage = (index: number) => {
    const imageToRemove = formData.images[index];
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      removedImages: [...prev.removedImages, imageToRemove]
    }));
  };
  
  // Remove a new image
  const handleRemoveNewImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(formData.newImageUrls[index]);
    
    setFormData(prev => ({
      ...prev,
      newImageUrls: prev.newImageUrls.filter((_, i) => i !== index),
      newImages: prev.newImages.filter((_, i) => i !== index)
    }));
  };
  
  // Validate current step
  const validateStep = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (currentStep === STEPS.BASIC_INFO) {
      if (!formData.name.trim()) {
        newErrors.name = "Product name is required";
        isValid = false;
      }
      
      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
        isValid = false;
      }
      
      if (!formData.categoryId) {
        newErrors.categoryId = "Category is required";
        isValid = false;
      }
    }
    
    if (currentStep === STEPS.PRICING) {
      if (formData.price <= 0) {
        newErrors.price = "Price must be greater than 0";
        isValid = false;
      }
      
      if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
        newErrors.price = "Discount must be between 0 and 100%";
        isValid = false;
      }
    }
    
    if (currentStep === STEPS.IMAGES) {
      // Check if there's at least one image (either existing or new)
      if (formData.images.length === 0 && formData.newImages.length === 0) {
        newErrors.images = "At least one image is required";
        isValid = false;
      }
    }
    
    if (currentStep === STEPS.INVENTORY) {
      if (formData.stock < 1) {
        newErrors.stock = "Stock must be at least 1";
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Navigate to next step
  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Calculate discounted price
  const discountedPrice = formData.price * (1 - formData.discountPercentage / 100);
  
  // Submit the form
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object for the API request
      const productData = new FormData();
      
      // Add basic fields
      productData.append("productId", product.id);
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("categoryId", formData.categoryId);
      productData.append("price", formData.price.toString());
      productData.append("discountPercentage", formData.discountPercentage.toString());
      productData.append("stock", formData.stock.toString());
      
      // Add images to keep
      formData.images.forEach(imageUrl => {
        productData.append("keepImages", imageUrl);
      });
      
      // Add new images
      formData.newImages.forEach(file => {
        productData.append("newImages", file);
      });
      
      // Send the request to the API
      const response = await fetch("/api/seller/products", {
        method: "PUT",
        body: productData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }
      
      // interface UpdatedProductResponse {
      //   success: boolean;
      //   data?: {
      //     id: string;
      //     name: string;
      //     description: string;
      //     price: number;
      //     discountPercentage: number;
      //     stock: number;
      //     images: string[];
      //     categoryId: string;
      //     sellerId?: string;
      //     createdAt?: string;
      //     updatedAt?: string;
      //     cloudinaryPublicId?: string;
      //     category?: {
      //       id: string;
      //       name: string;
      //     };
      //     reviewCount?: number;
      //     rating?: number;
      //     viewCount?: number;
      //   };
      //   error?: string;
      // }


      // const updatedProduct = await response.json() as UpdatedProductResponse;
      
      // Show success message and redirect
      toast({
        title: "Product Updated",
        description: "Your product has been updated successfully.",
        variant: "success",
        icon: <Check className="h-4 w-4" />,
      });
      
      router.push("/seller/products");
      router.refresh();
    } catch (error: unknown) {
      console.error("Error updating product:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Describe your product in detail"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  errors.categoryId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
            </div>
          </div>
        );
        
      case STEPS.PRICING:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price || ""}
                onChange={handleNumericChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                id="discountPercentage"
                name="discountPercentage"
                value={formData.discountPercentage || ""}
                onChange={handleNumericChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="0"
              />
            </div>
            
            {formData.discountPercentage > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Original Price:</span>
                  <span className="text-gray-600">₹{formData.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-green-600">-₹{(formData.price - discountedPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 font-medium">
                  <span className="text-sm">Final Price:</span>
                  <span>₹{discountedPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        );
        
      case STEPS.IMAGES:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Images <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Up to 5 images)</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                {/* Existing images */}
                {formData.images.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {/* New images */}
                {formData.newImageUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={url}
                      alt={`New product image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">New</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {/* Add image button */}
                {formData.images.length + formData.newImageUrls.length < 5 && (
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center p-4">
                      <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Add Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tips:</span> Upload high-quality images from different angles. The first image will be the main product image.
                </p>
              </div>
            </div>
          </div>
        );
        
      case STEPS.INVENTORY:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock || ""}
                onChange={handleNumericChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
                  errors.stock ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="1"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Inventory Management</h4>
              <p className="text-sm text-gray-600">
                Stock will automatically decrease as customers purchase your product. You can update the stock quantity at any time from your seller dashboard.
              </p>
            </div>
          </div>
        );
        
      case STEPS.REVIEW:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Product Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Category:</span>
                      <p className="font-medium">
                        {categories.find(c => c.id === formData.categoryId)?.name || ""}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Description:</span>
                      <p className="text-sm text-gray-700">{formData.description}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Pricing & Inventory</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Original Price:</span>
                      <span className="font-medium">₹{formData.price.toFixed(2)}</span>
                    </div>
                    
                    {formData.discountPercentage > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Discount:</span>
                          <span className="text-green-600">{formData.discountPercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Final Price:</span>
                          <span className="font-medium">₹{discountedPrice.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Stock:</span>
                      <span className="font-medium">{formData.stock} units</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-2">Product Images</h4>
                <div className="grid grid-cols-5 gap-2">
                  {/* Existing images */}
                  {formData.images.map((url, index) => (
                    <div key={`review-existing-${index}`} className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Product image ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                  
                  {/* New images */}
                  {formData.newImageUrls.map((url, index) => (
                    <div key={`review-new-${index}`} className="aspect-square rounded-lg overflow-hidden relative">
                      <Image
                        src={url}
                        alt={`New product image ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">New</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please review all information carefully before submitting. Your changes will be visible to customers immediately after updating.
              </p>
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Progress indicator
  const progress = ((currentStep + 1) / (Object.keys(STEPS).length / 2)) * 100;
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 md:p-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Pricing</span>
          <span>Images</span>
          <span>Inventory</span>
          <span>Review</span>
        </div>
      </div>
      
      {/* Form title */}
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-gray-800">
          {currentStep === STEPS.REVIEW ? "Review Your Changes" : "Edit Product"}
        </h2>
        <p className="text-gray-600 mt-1">
          {currentStep === STEPS.BASIC_INFO && "Update the basic information about your product."}
          {currentStep === STEPS.PRICING && "Modify your product's price and any applicable discounts."}
          {currentStep === STEPS.IMAGES && "Update or add new images of your product."}
          {currentStep === STEPS.INVENTORY && "Update how many units you have in stock."}
          {currentStep === STEPS.REVIEW && "Review all changes before updating your product."}
        </p>
      </div>
      
      {/* Form content */}
      <form onSubmit={(e) => e.preventDefault()}>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderFormStep()}
        </motion.div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStep < STEPS.REVIEW ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Update Product
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
