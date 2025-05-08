import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('Categories created successfully!');
}

createCategories()
  .catch(e => {
    console.error('Error creating categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
