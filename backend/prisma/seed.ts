import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

// Đọc file JSON từ prisma/data (đã copy vào backend folder)
const productsJsonPath = path.join(__dirname, 'data/products.json');
const productsData = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));

const ingredientsJsonPath = path.join(__dirname, 'data/ingredients.json');
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
    // Transform category image path: /src/assets/img/... -> /img/...
    const categoryImagePath = cat.image 
      ? cat.image.replace('/src/assets/img/', '/img/')
      : null;

    const category = await prisma.category.create({
      data: {
        name: cat.name,
        image: categoryImagePath,
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

    // Transform image path: /src/assets/img/gallery/... -> /img/gallery/...
    const imagePath = prod.image 
      ? prod.image.replace('/src/assets/img/', '/img/')
      : null;

    // Tạo product với sizes và toppings
    const product = await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description || null,
        price: prod.price,
        categoryId: categoryId,
        image: imagePath,
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
    paymentMethod: 'CASH' | 'QR';
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
      paymentMethod: 'QR',
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

  // Hàm tính số lượng nguyên liệu dựa trên tên sản phẩm và nguyên liệu
  const calculateIngredientQuantity = (productName: string, ingredientName: string, _productId: number): number => {
    const name = productName.toLowerCase();
    const ingName = ingredientName.toLowerCase();

    // Cà phê - Hạt cà phê
    if (ingName.includes('hạt cà phê') || ingName.includes('coffee_beans')) {
      if (name.includes('americano')) return 20; // 20g cho 1 ly Americano
      if (name.includes('espresso')) return 18; // 18g cho 1 ly Espresso
      if (name.includes('cappuccino')) return 15; // 15g cho Cappuccino
      if (name.includes('latte')) return 15; // 15g cho Latte
      if (name.includes('cà phê phin') || name.includes('phin')) return 12; // 12g cho phin
      if (name.includes('bạc xỉu')) return 10; // 10g cho bạc xỉu
      return 15; // Mặc định 15g
    }

    // Sữa tươi
    if (ingName.includes('sữa tươi') || ingName.includes('fresh_milk')) {
      if (name.includes('latte')) return 200; // 200ml cho Latte
      if (name.includes('cappuccino')) return 150; // 150ml cho Cappuccino
      if (name.includes('americano')) return 50; // 50ml nếu thêm sữa
      return 0;
    }

    // Sữa đặc
    if (ingName.includes('sữa đặc') || ingName.includes('condensed_milk')) {
      if (name.includes('bạc xỉu')) return 30; // 30ml cho bạc xỉu
      if (name.includes('cà phê sữa') || name.includes('phin sữa')) return 25; // 25ml
      return 0;
    }

    // Đường
    if (ingName.includes('đường') || ingName.includes('sugar')) {
      if (name.includes('ngọt') || name.includes('sữa') || name.includes('đá')) return 15; // 15g cho đồ ngọt
      if (name.includes('trà')) return 10; // 10g cho trà
      if (name.includes('bánh')) return 20; // 20g cho bánh
      return 10; // 10g mặc định
    }

    // Đá viên
    if (ingName.includes('đá viên') || ingName.includes('ice_cubes')) {
      if (name.includes('đá') || name.includes('lạnh') || name.includes('freeze')) return 10; // 10 viên
      return 0;
    }

    // Siro caramel
    if (ingName.includes('caramel') || ingName.includes('caramel_syrup')) {
      if (name.includes('caramel')) return 25; // 25ml
      return 0;
    }

    // Siro vanilla
    if (ingName.includes('vanilla') || ingName.includes('vanilla_syrup')) {
      if (name.includes('vanilla') || name.includes('latte') || name.includes('cappuccino')) return 15; // 15ml
      return 0;
    }

    // Kem tươi
    if (ingName.includes('kem tươi') || ingName.includes('whipped_cream')) {
      if (name.includes('kem') || name.includes('whipped') || name.includes('freeze')) return 30; // 30ml
      if (name.includes('bánh choux')) return 20; // 20ml cho bánh choux
      return 0;
    }

    // Bột trà xanh
    if (ingName.includes('trà xanh') || ingName.includes('matcha') || ingName.includes('matcha_powder')) {
      if (name.includes('trà xanh') || name.includes('matcha') || name.includes('freeze trà xanh')) return 10; // 10g
      if (name.includes('phô mai trà xanh')) return 8; // 8g cho bánh
      return 0;
    }

    // Siro đào
    if (ingName.includes('đào') || ingName.includes('peach') || ingName.includes('peach_syrup')) {
      if (name.includes('đào')) return 25; // 25ml
      return 0;
    }

    // Siro vải
    if (ingName.includes('vải') || ingName.includes('lychee') || ingName.includes('lychee_syrup')) {
      if (name.includes('vải')) return 25; // 25ml
      return 0;
    }

    // Hạt sen
    if (ingName.includes('sen') || ingName.includes('lotus') || ingName.includes('lotus_seed')) {
      if (name.includes('sen')) return 20; // 20g
      return 0;
    }

    // Thạch
    if (ingName.includes('thạch') || ingName.includes('jelly')) {
      if (name.includes('thạch')) return 30; // 30g
      return 0;
    }

    // Bột cacao
    if (ingName.includes('cacao') || ingName.includes('cocoa') || ingName.includes('cocoa_powder')) {
      if (name.includes('cacao') || name.includes('chocolate') || name.includes('mousse cacao')) return 15; // 15g
      if (name.includes('freeze chocolate')) return 10; // 10g
      return 0;
    }

    // Siro dâu
    if (ingName.includes('dâu') || ingName.includes('strawberry') || ingName.includes('strawberry_syrup')) {
      if (name.includes('dâu')) return 20; // 20ml
      return 0;
    }

    // Bột mì
    if (ingName.includes('bột mì') || ingName.includes('flour')) {
      if (name.includes('bánh')) return 100; // 100g cho các loại bánh
      return 0;
    }

    // Trứng
    if (ingName.includes('trứng') || ingName.includes('eggs')) {
      if (name.includes('bánh')) return 2; // 2 quả trứng cho bánh
      if (name.includes('pizza')) return 0; // Pizza không dùng trứng
      return 0;
    }

    // Bơ
    if (ingName.includes('bơ') || ingName.includes('butter')) {
      if (name.includes('bánh')) return 30; // 30g cho bánh
      return 0;
    }

    // Phô mai
    if (ingName.includes('phô mai') || ingName.includes('cheese')) {
      if (name.includes('phô mai')) return 50; // 50g cho bánh phô mai
      if (name.includes('cheese burger') || name.includes('burger')) return 30; // 30g cho burger
      if (name.includes('pizza')) return 80; // 80g cho pizza
      return 0;
    }

    // Thịt bò
    if (ingName.includes('thịt bò') || ingName.includes('beef')) {
      if (name.includes('burger thịt bò')) return 150; // 150g
      if (name.includes('bít tết')) return 200; // 200g
      if (name.includes('mì') || name.includes('noodles')) return 100; // 100g
      return 0;
    }

    // Thịt gà
    if (ingName.includes('thịt gà') || ingName.includes('chicken')) {
      if (name.includes('gà rán')) return 200; // 200g
      return 0;
    }

    // Bánh mì
    if (ingName.includes('bánh mì') || ingName.includes('bread')) {
      if (name.includes('burger') || name.includes('sandwich')) return 1; // 1 cái
      return 0;
    }

    // Rau xà lách
    if (ingName.includes('xà lách') || ingName.includes('lettuce')) {
      if (name.includes('burger') || name.includes('sandwich')) return 20; // 20g
      return 0;
    }

    // Cà chua
    if (ingName.includes('cà chua') || ingName.includes('tomato')) {
      if (name.includes('burger') || name.includes('sandwich')) return 30; // 30g
      if (name.includes('pizza')) return 50; // 50g
      return 0;
    }

    // Hành tây
    if (ingName.includes('hành') || ingName.includes('onion')) {
      if (name.includes('burger') || name.includes('sandwich') || name.includes('mì')) return 15; // 15g
      if (name.includes('pizza')) return 20; // 20g
      return 0;
    }

    // Mì
    if (ingName.includes('mì') || ingName.includes('noodles')) {
      if (name.includes('mì') || name.includes('noodles')) return 150; // 150g
      return 0;
    }

    // Bột bánh pizza
    if (ingName.includes('bột bánh pizza') || ingName.includes('pizza_dough')) {
      if (name.includes('pizza')) return 200; // 200g
      return 0;
    }

    // Nấm
    if (ingName.includes('nấm') || ingName.includes('mushroom')) {
      if (name.includes('pizza')) return 30; // 30g
      return 0;
    }

    // Ô liu
    if (ingName.includes('ô liu') || ingName.includes('olive')) {
      if (name.includes('pizza')) return 15; // 15g
      return 0;
    }

    // Pepperoni
    if (ingName.includes('pepperoni')) {
      if (name.includes('pizza')) return 40; // 40g
      return 0;
    }

    // Bột chiên gà
    if (ingName.includes('bột chiên') || ingName.includes('chicken_breading')) {
      if (name.includes('gà rán')) return 50; // 50g
      return 0;
    }

    // Nước cốt dừa
    if (ingName.includes('nước cốt dừa') || ingName.includes('coconut_milk')) {
      if (name.includes('súp thái')) return 100; // 100ml
      return 0;
    }

    // Sả
    if (ingName.includes('sả') || ingName.includes('lemongrass')) {
      if (name.includes('súp thái')) return 10; // 10g
      return 0;
    }

    // Ớt
    if (ingName.includes('ớt') || ingName.includes('chili')) {
      if (name.includes('súp thái')) return 5; // 5g
      return 0;
    }

    // Mascarpone (cho Tiramisu)
    if (ingName.includes('mascarpone')) {
      if (name.includes('tiramisu')) return 100; // 100g
      return 0;
    }

    // Bánh quy ladyfinger (cho Tiramisu)
    if (ingName.includes('ladyfinger')) {
      if (name.includes('tiramisu')) return 6; // 6 cái
      return 0;
    }

    // Rượu cà phê (cho Tiramisu)
    if (ingName.includes('rượu cà phê') || ingName.includes('coffee_liqueur')) {
      if (name.includes('tiramisu')) return 20; // 20ml
      return 0;
    }

    // Mặc định
    return 0;
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
      const quantity = calculateIngredientQuantity(product.name, ing.name, product.id);

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

