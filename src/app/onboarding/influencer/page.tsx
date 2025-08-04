"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const platforms = [
  "Instagram", "Facebook", "WhatsApp", "Twitter", "YouTube", "TikTok", "Other"
];

export default function InfluencerOnboardingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    platform: "",
    profilelink: "",
    followerscount: "",
    secondaryplatform: "",
    secondaryprofilelink: "",
    bankaccountname: "",
    bankaccountnumber: "",
    ifsccode: "",
    bankname: "",
    bankbranch: "",
    upiid: "",
    panortaxid: "",
    kycdocument: null as File | null,
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isLoading && !user) {
    router.push("/sign-in");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, kycdocument: e.target.files?.[0] || null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let kycdocumentUrl = "";
    if (form.kycdocument) {
      const fd = new FormData();
      fd.append("file", form.kycdocument);
      fd.append("folder", "kiva/influencer/kyc");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      kycdocumentUrl = uploadData.url;
    }

    const res = await fetch("/api/user/influencer-onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, kycdocument: kycdocumentUrl }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-heading text-primary mb-4">Thank you!</h1>
        <p className="text-gray-700 mb-4">
          Your influencer profile has been submitted for review. You’ll be notified once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <h1 className="text-3xl font-heading text-primary mb-8 text-center">
        Influencer Onboarding
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} required type="email" className="w-full px-4 py-2 border border-gray-200 rounded-lg" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio/About</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Primary Platform</label>
            <select name="platform" value={form.platform} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg">
              <option value="">Select Platform</option>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profile Link</label>
            <input name="profilelink" value={form.profilelink} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Followers Count</label>
            <input name="followerscount" value={form.followerscount} onChange={handleChange} type="number" min={0} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secondary Platform (optional)</label>
            <select name="secondaryplatform" value={form.secondaryplatform} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg">
              <option value="">None</option>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secondary Profile Link</label>
            <input name="secondaryprofilelink" value={form.secondaryprofilelink} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Account Holder Name</label>
            <input name="bankaccountname" value={form.bankaccountname} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bank Account Number</label>
            <input name="bankaccountnumber" value={form.bankaccountnumber} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC/SWIFT Code</label>
            <input name="ifsccode" value={form.ifsccode} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input name="bankname" value={form.bankname} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bank Branch</label>
            <input name="bankbranch" value={form.bankbranch} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">UPI ID (optional)</label>
            <input name="upiid" value={form.upiid} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PAN or Tax ID</label>
            <input name="panortaxid" value={form.panortaxid} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Upload KYC Document</label>
            <input name="kycdocument" type="file" accept="image/*,application/pdf" onChange={handleFileChange} required className="w-full" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows={2} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit for Review"
          )}
        </button>
      </form>
    </div>
  );
}