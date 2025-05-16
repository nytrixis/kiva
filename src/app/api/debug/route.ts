import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// // const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  // Supabase client does not expose table keys directly, so list them manually or return a static array
  // You can update this list if your schema changes
  const keys = [
    "user",
    "category",
    "product",
    "cart_item",
    "order",
    "order_item",
    "address",
    "seller_profile"
  ];
  return NextResponse.json({ keys });
}