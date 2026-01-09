import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testCloudinaryConnection() {
  console.log('🔍 Kiểm tra cấu hình Cloudinary...\n');

  // Check environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('📋 Thông tin cấu hình:');
  console.log(`   Cloud Name: ${cloudName ? '✅ ' + cloudName : '❌ Chưa cấu hình'}`);
  console.log(`   API Key: ${apiKey ? '✅ ' + apiKey.substring(0, 6) + '...' : '❌ Chưa cấu hình'}`);
  console.log(`   API Secret: ${apiSecret ? '✅ ' + apiSecret.substring(0, 6) + '...' : '❌ Chưa cấu hình'}`);
  console.log('');

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Thiếu thông tin cấu hình Cloudinary!');
    console.error('   Vui lòng kiểm tra file .env và đảm bảo có đủ 3 biến:');
    console.error('   - CLOUDINARY_CLOUD_NAME');
    console.error('   - CLOUDINARY_API_KEY');
    console.error('   - CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log('🔌 Đang kiểm tra kết nối với Cloudinary...\n');

  try {
    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    
    console.log('✅ Kết nối Cloudinary thành công!');
    console.log('   Status: ' + result.status);
    console.log('');

    // Test upload capabilities by checking account (optional - không bắt buộc)
    try {
      const accountInfo = await cloudinary.api.account();
      console.log('📊 Thông tin tài khoản Cloudinary:');
      console.log(`   Cloud Name: ${accountInfo.cloud_name}`);
      console.log(`   Plan: ${accountInfo.plan || 'Free'}`);
      console.log(`   Sub-Accounts: ${accountInfo.sub_accounts || 0}`);
      console.log('');
    } catch (error) {
      // Không hiển thị cảnh báo vì đây không phải lỗi nghiêm trọng
      // Endpoint này chỉ cần thiết để xem thông tin chi tiết tài khoản
      // Upload/Delete vẫn hoạt động bình thường
    }

    // Test upload with a small test image (1x1 pixel PNG)
    console.log('📤 Đang test upload hình ảnh...');
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ocha-pos/test',
          resource_type: 'image',
          public_id: `test-${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(testImageBuffer);
    });

    if (uploadResult && typeof uploadResult === 'object' && 'secure_url' in uploadResult) {
      console.log('✅ Upload test thành công!');
      console.log(`   URL: ${uploadResult.secure_url}`);
      console.log(`   Public ID: ${uploadResult.public_id}`);
      console.log('');

      // Clean up test image
      try {
        await cloudinary.uploader.destroy((uploadResult as any).public_id);
        console.log('🧹 Đã xóa hình ảnh test');
      } catch (error) {
        console.log('⚠️  Không thể xóa hình ảnh test (không sao)');
      }
    }

    console.log('');
    console.log('🎉 Tất cả kiểm tra đều thành công!');
    console.log('   Cloudinary đã sẵn sàng để sử dụng.');
    console.log('   Hình ảnh sẽ được upload lên Cloudinary thay vì localhost.');

  } catch (error: any) {
    console.error('❌ Lỗi khi kiểm tra Cloudinary:');
    
    // Extract error message from nested error object
    const errorMessage = error.error?.message || error.message || String(error);
    const httpCode = error.error?.http_code || error.http_code;
    
    console.error(`   Message: ${errorMessage}`);
    if (httpCode) {
      console.error(`   HTTP Code: ${httpCode}`);
    }
    
    if (httpCode === 401) {
      console.error('');
      console.error('⚠️  Lỗi xác thực! Vui lòng kiểm tra lại:');
      
      if (errorMessage.includes('disabled')) {
        console.error('   ❌ Tài khoản Cloudinary đã bị vô hiệu hóa');
        console.error('   → Vui lòng đăng nhập vào Cloudinary Dashboard để kích hoạt lại');
        console.error('   → Hoặc tạo tài khoản mới tại: https://cloudinary.com/');
      } else {
        console.error('   - API Key và API Secret có đúng không?');
        console.error('   - API Key có đang active không?');
        console.error('   - Kiểm tra lại trong Dashboard > Settings > Product Environment Credentials');
      }
    }
    
    process.exit(1);
  }
}

testCloudinaryConnection().catch((error) => {
  console.error('❌ Lỗi không mong đợi:', error);
  process.exit(1);
});

