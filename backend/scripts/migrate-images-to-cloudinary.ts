import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import cloudinary from '../src/config/cloudinary';
import env from '../src/config/env';

const prisma = new PrismaClient();

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload image file to Cloudinary
 */
async function uploadImageToCloudinary(
  filePath: string, 
  name: string, 
  type: 'product' | 'category' = 'product'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Create a readable stream from buffer
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    // Generate a safe filename from name
    const safeName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    // Upload to Cloudinary
    const folder = type === 'category' ? 'ocha-pos/categories' : 'ocha-pos/products';
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: `${safeName}-${Date.now()}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    bufferStream.pipe(uploadStream);
  });
}

/**
 * Resolve image path from different sources
 */
function resolveImagePath(imagePath: string | null): string | null {
  if (!imagePath) return null;

  // Skip if already Cloudinary URL
  if (imagePath.includes('cloudinary.com')) {
    return null; // Already uploaded
  }

  // Handle frontend asset path: /img/gallery/... -> frontend/src/assets/img/gallery/...
  if (imagePath.startsWith('/img/')) {
    const frontendAssetPath = path.join(
      __dirname,
      '../../frontend/src/assets',
      imagePath.replace('/img/', '/img/')
    );
    if (fs.existsSync(frontendAssetPath)) {
      return frontendAssetPath;
    }
  }

  // Handle old seed data path: /src/assets/img/gallery/... -> frontend/src/assets/img/gallery/...
  if (imagePath.startsWith('/src/assets/')) {
    const frontendAssetPath = path.join(
      __dirname,
      '../../frontend/src/assets',
      imagePath.replace('/src/assets/', '/')
    );
    if (fs.existsSync(frontendAssetPath)) {
      return frontendAssetPath;
    }
  }

  // Handle local upload path: /uploads/images/... -> backend/uploads/images/...
  if (imagePath.startsWith('/uploads/images/')) {
    const localUploadPath = path.join(
      __dirname,
      '../../uploads/images',
      imagePath.replace('/uploads/images/', '')
    );
    if (fs.existsSync(localUploadPath)) {
      return localUploadPath;
    }
  }

  // Try relative path from backend root
  const relativePath = path.join(__dirname, '../..', imagePath);
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  return null;
}

async function main() {
  console.log('🚀 Bắt đầu migration hình ảnh lên Cloudinary...\n');

  // Check Cloudinary configuration
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary chưa được cấu hình!');
    console.error('Vui lòng thêm CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET vào .env');
    process.exit(1);
  }

  console.log('✅ Cloudinary đã được cấu hình\n');

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  // Get all categories
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  console.log(`📦 Tìm thấy ${products.length} products và ${categories.length} categories\n`);

  let productSuccessCount = 0;
  let productSkipCount = 0;
  let productErrorCount = 0;

  let categorySuccessCount = 0;
  let categorySkipCount = 0;
  let categoryErrorCount = 0;

  // Migrate Products
  console.log('🛍️  Bắt đầu migration hình ảnh Products...\n');
  for (const product of products) {
    try {
      // Skip if no image
      if (!product.image) {
        console.log(`⏭️  [Product: ${product.name}] - Không có hình ảnh, bỏ qua`);
        productSkipCount++;
        continue;
      }

      // Skip if already Cloudinary URL
      if (product.image.includes('cloudinary.com')) {
        console.log(`⏭️  [Product: ${product.name}] - Đã có trên Cloudinary, bỏ qua`);
        productSkipCount++;
        continue;
      }

      // Resolve image path
      const imagePath = resolveImagePath(product.image);
      
      if (!imagePath) {
        console.log(`⚠️  [Product: ${product.name}] - Không tìm thấy file: ${product.image}`);
        productErrorCount++;
        continue;
      }

      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  [Product: ${product.name}] - File không tồn tại: ${imagePath}`);
        productErrorCount++;
        continue;
      }

      // Upload to Cloudinary
      console.log(`📤 [Product: ${product.name}] - Đang upload...`);
      const result = await uploadImageToCloudinary(imagePath, product.name, 'product');

      // Update database
      await prisma.product.update({
        where: { id: product.id },
        data: { image: result.url },
      });

      console.log(`✅ [Product: ${product.name}] - Upload thành công: ${result.url}\n`);
      productSuccessCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      console.error(`❌ [Product: ${product.name}] - Lỗi: ${error.message}\n`);
      productErrorCount++;
    }
  }

  // Migrate Categories
  console.log('\n📁 Bắt đầu migration hình ảnh Categories...\n');
  for (const category of categories) {
    try {
      // Skip if no image
      if (!category.image) {
        console.log(`⏭️  [Category: ${category.name}] - Không có hình ảnh, bỏ qua`);
        categorySkipCount++;
        continue;
      }

      // Skip if already Cloudinary URL
      if (category.image.includes('cloudinary.com')) {
        console.log(`⏭️  [Category: ${category.name}] - Đã có trên Cloudinary, bỏ qua`);
        categorySkipCount++;
        continue;
      }

      // Resolve image path
      const imagePath = resolveImagePath(category.image);
      
      if (!imagePath) {
        console.log(`⚠️  [Category: ${category.name}] - Không tìm thấy file: ${category.image}`);
        categoryErrorCount++;
        continue;
      }

      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  [Category: ${category.name}] - File không tồn tại: ${imagePath}`);
        categoryErrorCount++;
        continue;
      }

      // Upload to Cloudinary
      console.log(`📤 [Category: ${category.name}] - Đang upload...`);
      const result = await uploadImageToCloudinary(imagePath, category.name, 'category');

      // Update database
      await prisma.category.update({
        where: { id: category.id },
        data: { image: result.url },
      });

      console.log(`✅ [Category: ${category.name}] - Upload thành công: ${result.url}\n`);
      categorySuccessCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      console.error(`❌ [Category: ${category.name}] - Lỗi: ${error.message}\n`);
      categoryErrorCount++;
    }
  }

  console.log('\n📊 Kết quả migration Products:');
  console.log(`   ✅ Thành công: ${productSuccessCount}`);
  console.log(`   ⏭️  Bỏ qua: ${productSkipCount}`);
  console.log(`   ❌ Lỗi: ${productErrorCount}`);
  console.log(`   📦 Tổng cộng: ${products.length}`);

  console.log('\n📊 Kết quả migration Categories:');
  console.log(`   ✅ Thành công: ${categorySuccessCount}`);
  console.log(`   ⏭️  Bỏ qua: ${categorySkipCount}`);
  console.log(`   ❌ Lỗi: ${categoryErrorCount}`);
  console.log(`   📦 Tổng cộng: ${categories.length}`);

  console.log('\n🎉 Migration hoàn tất!');
  console.log(`   Tổng thành công: ${productSuccessCount + categorySuccessCount}`);
  console.log(`   Tổng bỏ qua: ${productSkipCount + categorySkipCount}`);
  console.log(`   Tổng lỗi: ${productErrorCount + categoryErrorCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

