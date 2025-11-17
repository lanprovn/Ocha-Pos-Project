import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

// Đọc file JSON từ frontend
const productsJsonPath = path.join(__dirname, '../../frontend/src/assets/products.json');
const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));

const ingredientsJsonPath = path.join(__dirname, '../../frontend/src/data/ingredients.json');
const ingredientsData = JSON.parse(fs.readFileSync(ingredientsJsonPath, 'utf-8'));

async function main() {
  console.log('🌱 Bắt đầu seed database...\n');

  // 1. Xóa dữ liệu cũ (optional - comment nếu muốn giữ lại)
  console.log('🗑️  Xóa dữ liệu cũ...');
  // Xóa dữ liệu một cách an toàn, bỏ qua nếu bảng chưa tồn tại
  const deleteOperations = [
    () => prisma.orderItem.deleteMany().catch(() => {}),
    () => prisma.order.deleteMany().catch(() => {}),
    () => prisma.productRecipe.deleteMany().catch(() => {}), // Xóa recipes trước
    () => prisma.stockTransaction.deleteMany().catch(() => {}),
    () => prisma.stockAlert.deleteMany().catch(() => {}),
    () => prisma.ingredientStock.deleteMany().catch(() => {}), // Xóa ingredient stocks trước
    () => prisma.ingredient.deleteMany().catch(() => {}), // Xóa ingredients
    () => prisma.stock.deleteMany().catch(() => {}),
    () => prisma.productTopping.deleteMany().catch(() => {}),
    () => prisma.productSize.deleteMany().catch(() => {}),
    () => prisma.product.deleteMany().catch(() => {}),
    () => prisma.category.deleteMany().catch(() => {}),
    () => prisma.user.deleteMany().catch(() => {}),
  ];
  
  await Promise.all(deleteOperations.map(op => op()));
  console.log('✅ Đã xóa dữ liệu cũ\n');

  // 2. Tạo Users (Staff và Admin)
  console.log('👤 Tạo users...');
  const staffPassword = await hashPassword('staff123');
  const adminPassword = await hashPassword('admin123');

  const staff = await prisma.user.create({
    data: {
      email: 'staff@ocha.com',
      password: staffPassword,
      name: 'Nhân Viên',
      role: 'STAFF',
      isActive: true,
    },
  });
  console.log(`  ✅ Created staff: ${staff.email} (password: staff123)`);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ocha.com',
      password: adminPassword,
      name: 'Quản Trị Viên',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`  ✅ Created admin: ${admin.email} (password: admin123)`);
  console.log('✅ Đã tạo users\n');

  // 3. Tạo Categories
  console.log('📁 Tạo categories...');
  const categoryMap = new Map<string, string>(); // category name -> categoryId

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

  // 4. Tạo Products
  console.log('🛍️  Tạo products...');
  const productMap = new Map<number, string>(); // old id -> new id

  for (const prod of productsData.products) {
    const categoryId = categoryMap.get(prod.category);
    
    if (!categoryId) {
      console.warn(`  ⚠️  Category "${prod.category}" không tồn tại, bỏ qua product: ${prod.name}`);
      continue;
    }

    // Tạo product với sizes và toppings
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
      include: {
        sizes: true,
        toppings: true,
      },
    });

    productMap.set(prod.id, product.id);
    console.log(`  ✅ Created product: ${prod.name} (${product.id})`);

    // Tạo stock record cho product
    await prisma.stock.create({
      data: {
        productId: product.id,
        quantity: prod.stock || 0,
        minStock: Math.floor((prod.stock || 0) * 0.2), // 20% của stock hiện tại
        maxStock: (prod.stock || 0) * 2, // 2x stock hiện tại
        unit: 'pcs',
        isActive: true,
      },
    });
  }
  console.log(`✅ Đã tạo ${productsData.products.length} products\n`);

  // 5. Tạo một vài Orders mẫu (optional)
  console.log('📦 Tạo orders mẫu...');
  const sampleOrders: Array<{
    customerName: string;
    customerPhone: string;
    customerTable?: string;
    paymentMethod: 'CASH' | 'CARD' | 'QR';
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
    orderCreator: 'STAFF' | 'CUSTOMER';
    orderCreatorName?: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      subtotal: number;
      selectedSize?: string;
      selectedToppings?: string[];
    }>;
  }> = [
    {
      customerName: 'Nguyễn Văn A',
      customerPhone: '0123456789',
      customerTable: 'Bàn 1',
      paymentMethod: 'CASH',
      paymentStatus: 'SUCCESS',
      orderCreator: 'STAFF',
      orderCreatorName: 'Nhân viên',
      items: [
        {
          productId: Array.from(productMap.values())[0],
          quantity: 2,
          price: 59000,
          subtotal: 118000,
          selectedSize: 'Vừa',
          selectedToppings: ['Thêm sữa'],
        },
        {
          productId: Array.from(productMap.values())[1],
          quantity: 1,
          price: 55000,
          subtotal: 55000,
          selectedSize: undefined,
          selectedToppings: [],
        },
      ],
    },
    {
      customerName: 'Trần Thị B',
      customerPhone: '0987654321',
      customerTable: 'Bàn 2',
      paymentMethod: 'CARD',
      paymentStatus: 'SUCCESS',
      orderCreator: 'CUSTOMER',
      items: [
        {
          productId: Array.from(productMap.values())[2],
          quantity: 3,
          price: 35000,
          subtotal: 105000,
          selectedSize: 'Lớn',
          selectedToppings: [],
        },
      ],
    },
  ];

  for (const orderData of sampleOrders) {
    const totalAmount = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'COMPLETED',
        totalAmount,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerTable: orderData.customerTable,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        orderCreator: orderData.orderCreator,
        orderCreatorName: orderData.orderCreatorName || null,
        paidAt: new Date(),
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            selectedSize: item.selectedSize ?? null,
            selectedToppings: item.selectedToppings ?? [],
            note: null,
          })),
        },
      },
    });
    console.log(`  ✅ Created order: ${order.orderNumber}`);
  }
  console.log(`✅ Đã tạo ${sampleOrders.length} orders mẫu\n`);

  // 6. Tạo Ingredients và Ingredient Stocks
  console.log('🥛 Tạo ingredients...');
  const ingredientMap = new Map<string, string>(); // old id -> new id

  for (const ing of ingredientsData.ingredients) {
    // Tạo ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: ing.name,
        unit: ing.unit,
      },
    });

    ingredientMap.set(ing.id, ingredient.id);

    // Tạo ingredient stock
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

  // 7. Tạo Product Recipes dựa trên usedIn
  console.log('📋 Tạo product recipes...');
  let recipeCount = 0;

  // Hàm tính số lượng nguyên liệu dựa trên tên sản phẩm
  const calculateIngredientQuantity = (productName: string, ingredientName: string): number => {
    const name = productName.toLowerCase();
    const ingName = ingredientName.toLowerCase();

    // Cà phê
    if (ingName.includes('cà phê') || ingName.includes('hạt cà phê')) {
      if (name.includes('americano') || name.includes('espresso')) return 20; // 20g
      if (name.includes('cappuccino') || name.includes('latte')) return 15; // 15g
      return 18; // Mặc định 18g
    }

    // Sữa
    if (ingName.includes('sữa tươi')) {
      if (name.includes('latte') || name.includes('cappuccino')) return 150; // 150ml
      if (name.includes('sữa')) return 100; // 100ml
      return 50; // 50ml
    }

    // Sữa đặc
    if (ingName.includes('sữa đặc')) {
      if (name.includes('cà phê sữa') || name.includes('bạc xỉu')) return 30; // 30ml
      return 20; // 20ml
    }

    // Đường
    if (ingName.includes('đường')) {
      if (name.includes('ngọt') || name.includes('sữa')) return 15; // 15g
      return 10; // 10g
    }

    // Đá viên
    if (ingName.includes('đá')) {
      if (name.includes('đá') || name.includes('lạnh')) return 10; // 10 viên
      return 0;
    }

    // Siro
    if (ingName.includes('siro') || ingName.includes('syrup')) {
      if (name.includes('caramel')) return 20; // 20ml
      if (name.includes('vanilla')) return 15; // 15ml
      if (name.includes('đào') || name.includes('peach')) return 25; // 25ml
      if (name.includes('vải') || name.includes('lychee')) return 25; // 25ml
      if (name.includes('dâu') || name.includes('strawberry')) return 20; // 20ml
      return 15; // 15ml
    }

    // Kem tươi
    if (ingName.includes('kem')) {
      if (name.includes('kem') || name.includes('whipped')) return 30; // 30ml
      return 0;
    }

    // Bột trà xanh
    if (ingName.includes('trà xanh') || ingName.includes('matcha')) {
      if (name.includes('trà xanh') || name.includes('matcha')) return 10; // 10g
      return 0;
    }

    // Hạt sen
    if (ingName.includes('sen') || ingName.includes('lotus')) {
      if (name.includes('sen')) return 20; // 20g
      return 0;
    }

    // Thạch
    if (ingName.includes('thạch') || ingName.includes('jelly')) {
      if (name.includes('thạch')) return 30; // 30g
      return 0;
    }

    // Bột cacao
    if (ingName.includes('cacao') || ingName.includes('cocoa')) {
      if (name.includes('cacao') || name.includes('chocolate')) return 8; // 8g
      return 0;
    }

    // Mặc định
    return 10;
  };

  // Tạo recipes cho mỗi ingredient dựa trên usedIn
  for (const ing of ingredientsData.ingredients) {
    const ingredientId = ingredientMap.get(ing.id);
    if (!ingredientId) continue;

    // usedIn chứa product IDs (old IDs từ products.json)
    for (const oldProductId of ing.usedIn || []) {
      const productId = productMap.get(parseInt(oldProductId));
      if (!productId) {
        console.warn(`  ⚠️  Product ID ${oldProductId} không tồn tại, bỏ qua recipe`);
        continue;
      }

      // Tìm product để lấy tên
      const product = productsData.products.find((p: any) => p.id === parseInt(oldProductId));
      if (!product) continue;

      // Tính số lượng nguyên liệu
      const quantity = calculateIngredientQuantity(product.name, ing.name);

      // Tạo recipe
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
        // Nếu recipe đã tồn tại (unique constraint), bỏ qua
        if (error.code === 'P2002') {
          console.warn(`  ⚠️  Recipe đã tồn tại cho product ${product.name} và ingredient ${ing.name}`);
        } else {
          console.error(`  ❌ Lỗi tạo recipe: ${error.message}`);
        }
      }
    }
  }
  console.log(`✅ Đã tạo ${recipeCount} product recipes\n`);

  console.log('🎉 Seed database hoàn tất!');
  console.log(`\n📊 Thống kê:`);
  console.log(`   - Users: 2 (1 Staff, 1 Admin)`);
  console.log(`   - Categories: ${productsData.categories.length}`);
  console.log(`   - Products: ${productsData.products.length}`);
  console.log(`   - Ingredients: ${ingredientsData.ingredients.length}`);
  console.log(`   - Recipes: ${recipeCount}`);
  console.log(`   - Orders: ${sampleOrders.length}`);
  console.log(`\n🔐 Thông tin đăng nhập:`);
  console.log(`   - Staff: staff@ocha.com / staff123`);
  console.log(`   - Admin: admin@ocha.com / admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

