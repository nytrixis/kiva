"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X, Loader2 } from "lucide-react";

interface InfluencerProfileFormProps {
  initialData: {
    name: string;
    image: string;
    bio: string;
    platform: string;
    profileLink: string;
    followerscount: string;
    panOrTaxId: string;
  };
}

export function InfluencerProfileForm({ initialData }: InfluencerProfileFormProps) {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/user/upload-profile-image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Failed to upload image");
        const result = await res.json();
        setForm((prev) => ({ ...prev, image: result.url }));
        setSuccess("Profile image updated!");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Image upload failed");
        } else {
          setError("Image upload failed");
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/user/influencer-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: form.image,
          bio: form.bio,
          platform: form.platform,
          profilelink: form.profileLink,
          followerscount: form.followerscount,
          panortaxid: form.panOrTaxId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-heading text-xl">Influencer Profile</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        {/* Profile Image and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Profile Image */}
          <div className="relative flex flex-col items-center">
            <label className="block text-sm font-medium mb-2">Profile Picture</label>
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200 mb-2 flex items-center justify-center">
              {form.image ? (
                <>
                  <Image
                    src={form.image}
                    alt="Profile"
                    fill
                    className="object-cover rounded-full"
                    sizes="128px"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">1:1 ratio</p>
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* X button outside the circle, always visible */}
            {form.image && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-8 right-32 z-30 p-1 bg-white/80 rounded-full shadow-sm hover:bg-red-100 transition-colors pointer-events-auto"
                aria-label="Remove profile image"
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              <Camera className="inline h-4 w-4 mr-2" />
              Upload Photo
            </button>
          </div>
          {/* Basic Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                rows={3}
              />
            </div>
          </div>
        </div>
        {/* Social Info */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Social Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <input
                type="text"
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Instagram, YouTube, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Link</label>
              <input
                type="url"
                name="profileLink"
                value={form.profileLink}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Followers Count</label>
              <input
                type="number"
                name="followerscount"
                value={form.followerscount}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        {/* Tax Info */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Tax Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">PAN/Tax ID</label>
              <input
                type="text"
                name="panOrTaxId"
                value={form.panOrTaxId}
                disabled
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {success && <div className="text-green-600 mt-4">{success}</div>}
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </form>
    </div>
  );
}