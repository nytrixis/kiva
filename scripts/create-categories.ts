import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// For admin scripts, use service_role key if available for upsert-like logic
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createCategories() {
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
    { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home decor and kitchen appliances' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Beauty products and personal care items' },
    { name: 'Books', slug: 'books', description: 'Books and literature' },
    { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, games, and entertainment items' },
    { name: 'Handcrafted', slug: 'handcrafted', description: 'Handmade and artisanal products' },
    { name: 'Jewelry & Accessories', slug: 'jewelry-accessories', description: 'Jewelry and fashion accessories' },
    { name: 'Art & Collectibles', slug: 'art-collectibles', description: 'Art pieces and collectible items' },
    { name: 'Food & Beverages', slug: 'food-beverages', description: 'Food products and beverages' }
  ];

  console.log('Creating categories...');

  for (const category of categories) {
    // Try to upsert: check if exists, then insert if not
    const { data: existing, error: fetchError } = await supabase
      .from('category')
      .select('id')
      .eq('slug', category.slug)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = No rows found, which is fine for insert
      console.error('Error checking category:', fetchError);
      continue;
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from('category')
        .insert([category]);
      if (insertError) {
        console.error('Error inserting category:', insertError);
      }
    }
    // If exists, do nothing (mimics upsert with empty update)
  }

  console.log('Categories created successfully!');
}

createCategories()
  .catch(e => {
    console.error('Error creating categories:', e);
    process.exit(1);
  });