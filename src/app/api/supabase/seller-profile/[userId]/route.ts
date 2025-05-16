import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return res.status(404).json(null);
  }
  res.status(200).json(data);
}