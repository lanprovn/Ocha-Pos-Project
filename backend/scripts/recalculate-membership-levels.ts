/**
 * Script to recalculate membership levels for all customers
 * Run: npx tsx scripts/recalculate-membership-levels.ts
 */

import prisma from '../src/config/database';
import { calculateMembershipLevel } from '../src/config/membership.config';

async function recalculateMembershipLevels() {
  console.log('🔄 Bắt đầu cập nhật cấp độ thành viên...\n');

  try {
    // Get all customers
    const customers = await prisma.customers.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        loyaltyPoints: true,
        membershipLevel: true,
      },
    });

    console.log(`📊 Tìm thấy ${customers.length} khách hàng\n`);

    let updated = 0;
    let unchanged = 0;
    const updates: Array<{ name: string; phone: string; oldLevel: string; newLevel: string; points: number }> = [];

    // Update each customer's membership level
    for (const customer of customers) {
      const correctLevel = calculateMembershipLevel(customer.loyaltyPoints);
      
      if (customer.membershipLevel !== correctLevel) {
        await prisma.customers.update({
          where: { id: customer.id },
          data: {
            membershipLevel: correctLevel,
            updatedAt: new Date(),
          },
        });
        updated++;
        updates.push({
          name: customer.name,
          phone: customer.phone,
          oldLevel: customer.membershipLevel,
          newLevel: correctLevel,
          points: customer.loyaltyPoints,
        });
      } else {
        unchanged++;
      }
    }

    console.log(`✅ Đã cập nhật: ${updated} khách hàng`);
    console.log(`ℹ️  Không thay đổi: ${unchanged} khách hàng\n`);

    if (updates.length > 0) {
      console.log('📋 Chi tiết các khách hàng được cập nhật:');
      console.log('─'.repeat(80));
      updates.forEach((update, index) => {
        console.log(`${index + 1}. ${update.name} (${update.phone})`);
        console.log(`   Điểm: ${update.points.toLocaleString()} | ${update.oldLevel} → ${update.newLevel}`);
      });
      console.log('─'.repeat(80));
    }

    console.log('\n✨ Hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
recalculateMembershipLevels();

