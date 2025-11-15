// Seed script for products/categories/ingredients only (keeps existing users)
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Đọc file JSON từ backend/prisma/data
let productsJsonPath = path.join(__dirname, 'data/products.json');
let ingredientsJsonPath = path.join(__dirname, 'data/ingredients.json');

// Fallback to frontend path if data folder doesn't exist (local dev)
if (!fs.existsSync(productsJsonPath)) {
  productsJsonPath = path.join(__dirname, '../../frontend/src/assets/products.json');
}
if (!fs.existsSync(ingredientsJsonPath)) {
  ingredientsJsonPath = path.join(__dirname, '../../frontend/src/data/ingredients.json');
}

const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
const ingredientsData = JSON.parse(fs.readFileSync(ingredientsJsonPath, 'utf-8'));

async function main() {
  console.log('🌱 Bắt đầu seed products/categories/ingredients...\n');

  // 1. Xóa dữ liệu cũ (nhưng giữ lại users và orders)
  console.log('🗑️  Xóa dữ liệu cũ (giữ lại users và orders)...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productRecipe.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.stockAlert.deleteMany();
  await prisma.ingredientStock.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.productTopping.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ Đã xóa dữ liệu cũ\n');

  // 2. Tạo Categories
  console.log('📁 Tạo categories...');
  const categoryMap = new Map<string, string>();

  for (const cat of productsData.categories) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        image: cat.image || null,
        description: cat.description || null,
        icon: null,
      },
    });
    categoryMap.set(cat.name, category.id);
    console.log(`  ✅ Created category: ${cat.name} (${category.id})`);
  }
  console.log(`✅ Đã tạo ${productsData.categories.length} categories\n`);

  // 3. Tạo Products
  console.log('🛍️  Tạo products...');
  const productMap = new Map<number, string>();

  for (const prod of productsData.products) {
    const categoryId = categoryMap.get(prod.category);
    
    if (!categoryId) {
      console.warn(`  ⚠️  Category "${prod.category}" không tồn tại, bỏ qua product: ${prod.name}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description || null,
        price: prod.price,
        categoryId: categoryId,
        image: prod.image || null,
        rating: prod.rating ? parseFloat(prod.rating.toString()) : null,
        discount: prod.discount ? parseFloat(prod.discount.toString()) : null,
        stock: prod.stock || 0,
        isAvailable: prod.isAvailable !== false,
        isPopular: prod.isPopular || false,
        tags: prod.tags || [],
        sizes: prod.sizes ? {
          create: prod.sizes.map((s: any) => ({
            name: s.name,
            extraPrice: s.extraPrice || 0,
          })),
        } : undefined,
        toppings: prod.toppings ? {
          create: prod.toppings.map((t: any) => ({
            name: t.name,
            extraPrice: t.extraPrice || 0,
          })),
        } : undefined,
      },
    });

    productMap.set(prod.id, product.id);
    console.log(`  ✅ Created product: ${prod.name} (${product.id})`);

    // Tạo stock record cho product
    await prisma.stock.create({
      data: {
        productId: product.id,
        quantity: prod.stock || 0,
        minStock: Math.floor((prod.stock || 0) * 0.2),
        maxStock: (prod.stock || 0) * 2,
        unit: 'pcs',
        isActive: true,
      },
    });
  }
  console.log(`✅ Đã tạo ${productsData.products.length} products\n`);

  // 4. Tạo Ingredients và Ingredient Stocks
  console.log('🥛 Tạo ingredients...');
  const ingredientMap = new Map<string, string>();

  for (const ing of ingredientsData.ingredients) {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: ing.name,
        unit: ing.unit,
      },
    });

    ingredientMap.set(ing.id, ingredient.id);

    await prisma.ingredientStock.create({
      data: {
        ingredientId: ingredient.id,
        quantity: ing.currentStock || 0,
        minStock: ing.minStock || 0,
        maxStock: ing.maxStock || 0,
        isActive: ing.isActive !== false,
        lastUpdated: ing.lastUpdated ? new Date(ing.lastUpdated) : new Date(),
      },
    });

    console.log(`  ✅ Created ingredient: ${ing.name} (${ingredient.id})`);
  }
  console.log(`✅ Đã tạo ${ingredientsData.ingredients.length} ingredients\n`);

  // 5. Tạo Product Recipes
  console.log('📋 Tạo product recipes...');
  let recipeCount = 0;

  const calculateIngredientQuantity = (productName: string, ingredientName: string): number => {
    const name = productName.toLowerCase();
    const ingName = ingredientName.toLowerCase();

    if (ingName.includes('cà phê') || ingName.includes('hạt cà phê')) {
      if (name.includes('americano') || name.includes('espresso')) return 20;
      if (name.includes('cappuccino') || name.includes('latte')) return 15;
      return 18;
    }
    if (ingName.includes('sữa tươi')) {
      if (name.includes('latte') || name.includes('cappuccino')) return 150;
      if (name.includes('sữa')) return 100;
      return 50;
    }
    if (ingName.includes('sữa đặc')) {
      if (name.includes('cà phê sữa') || name.includes('bạc xỉu')) return 30;
      return 20;
    }
    if (ingName.includes('đường')) {
      if (name.includes('ngọt') || name.includes('sữa')) return 15;
      return 10;
    }
    if (ingName.includes('đá')) {
      if (name.includes('đá') || name.includes('lạnh')) return 10;
      return 0;
    }
    return 10;
  };

  for (const ing of ingredientsData.ingredients) {
    const ingredientId = ingredientMap.get(ing.id);
    if (!ingredientId) continue;

    for (const oldProductId of ing.usedIn || []) {
      const productId = productMap.get(parseInt(oldProductId));
      if (!productId) continue;

      const product = productsData.products.find((p: any) => p.id === parseInt(oldProductId));
      if (!product) continue;

      const quantity = calculateIngredientQuantity(product.name, ing.name);

      try {
        await prisma.productRecipe.create({
          data: {
            productId: productId,
            ingredientId: ingredientId,
            quantity: quantity,
            unit: ing.unit,
          },
        });
        recipeCount++;
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.error(`  ❌ Lỗi tạo recipe: ${error.message}`);
        }
      }
    }
  }
  console.log(`✅ Đã tạo ${recipeCount} product recipes\n`);

  console.log('🎉 Seed products/categories/ingredients hoàn tất!');
  console.log(`\n📊 Thống kê:`);
  console.log(`   - Categories: ${productsData.categories.length}`);
  console.log(`   - Products: ${productsData.products.length}`);
  console.log(`   - Ingredients: ${ingredientsData.ingredients.length}`);
  console.log(`   - Recipes: ${recipeCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

