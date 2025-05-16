import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Like {
  id: string;
  userId: string;
}

interface Reel {
  id: string;
  likes?: Like[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, take } = req.query;

  // Fetch reels with related user, product, and like/comment counts
  const { data: reels, error } = await supabase
    .from("reels")
    .select(`
      *,
      user:user_id (
        id,
        name,
        image,
        sellerProfile:seller_profile_id (
          businessName,
          logoImage
        )
      ),
      product:product_id (
        id,
        name,
        price,
        images,
        discountPercentage
      ),
      likes:user_id (
        id
      ),
      _count:reels (
        likes,
        comments
      )
    `)
    .order("createdAt", { ascending: false })
    .limit(Number(take) || 5);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Optionally, filter likes for the current user
  const reelsWithLikes = (reels || []).map((reel: Reel) => ({
    ...reel,
    likes: reel.likes?.filter((like: Like) => like.id === userId) || [],
  }));

  res.status(200).json(reelsWithLikes);
}