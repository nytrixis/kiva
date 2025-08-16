import { Metadata } from "next";
import { notFound } from "next/navigation";
import InfluencerProfileClient from "./InfluencerProfileClient";

interface InfluencerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InfluencerPageProps): Promise<Metadata> {
  const { id } = await params;

  // Fetch influencer data for metadata
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/influencer/profile/${id}`,
    { cache: "no-store" }
  );
  const data = res.ok ? await res.json() : null;

  if (!data?.profile) {
    return {
      title: "Influencer Not Found | Ajyaa",
    };
  }

  return {
    title: `${data.profile.name} (@${data.profile.platform}) | Ajyaa`,
    description: data.profile.bio || `Check out ${data.profile.name}'s profile on Ajyaa`,
    openGraph: {
      images: [data.profile.image || "/images/placeholder-avatar.jpg"],
    },
  };
}

export default async function InfluencerPage({ params }: InfluencerPageProps) {
  const { id } = await params;

  // Fetch influencer data
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/influencer/profile/${id}`,
    { cache: "no-store" }
  );
  
  if (!res.ok) {
    notFound();
  }

  const data = await res.json();

  if (!data.profile || data.profile.status !== "APPROVED") {
    notFound();
  }

  return <InfluencerProfileClient initialData={data} influencerId={id} />;
}