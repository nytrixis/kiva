"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function InfluencerKYCPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchKYC = async () => {
      const res = await fetch("/api/user/influencer-profile");
      const data = await res.json();
      setKycStatus(data.profile?.status || "PENDING");
    };
    if (user) fetchKYC();
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-2">Influencer KYC Verification</h1>
      <p className="text-gray-600 mb-8">
        Complete your verification to start collaborating as an influencer on Ajyaa.
      </p>
      <div className="mb-6">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          kycStatus === "APPROVED"
            ? "bg-green-100 text-green-800"
            : kycStatus === "PENDING"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}>
          {kycStatus}
        </span>
      </div>
      <KYCUploadForm />
    </div>
  );
}

function KYCUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setSuccess(null);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "kiva/influencer/kyc");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error("Upload failed");

      // Update influencer profile with new KYC document
      const res = await fetch("/api/user/influencer-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kycdocument: uploadData.url }),
      });
      if (!res.ok) throw new Error("Failed to update KYC document");

      setSuccess("KYC document uploaded successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Upload KYC Document</label>
        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} required />
      </div>
      <button
        type="submit"
        disabled={uploading}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {success && <div className="text-green-600">{success}</div>}
      {error && <div className="text-red-600">{error}</div>}
    </form>
  );
}