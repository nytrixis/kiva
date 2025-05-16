import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sellerId } = req.query;

  if (!sellerId) {
    return res.status(400).json({ error: "Missing sellerId" });
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, images")
    .eq("seller_id", sellerId)
    .order("createdAt", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(products || []);
}