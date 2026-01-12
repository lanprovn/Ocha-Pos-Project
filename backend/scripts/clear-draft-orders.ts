/**
 * Script to clear all CREATING (draft) orders from database
 * Usage: tsx scripts/clear-draft-orders.ts
 */

import prisma from '../src/config/database';
import { emitDraftOrdersDeleted } from '../src/core/socket/socket.io';

async function clearAllDraftOrders() {
  try {
    console.log('🗑️  Đang tìm tất cả đơn đang tạo (CREATING)...');

    // Find all CREATING orders
    const draftOrders = await prisma.order.findMany({
      where: {
        status: 'CREATING',
      },
      select: {
        id: true,
        orderCreator: true,
        orderCreatorName: true,
        orderNumber: true,
      },
    });

    if (draftOrders.length === 0) {
      console.log('✅ Không có đơn đang tạo nào để xóa');
      return;
    }

    console.log(`📋 Tìm thấy ${draftOrders.length} đơn đang tạo:`);
    draftOrders.forEach((order) => {
      console.log(`   - ${order.orderNumber} (${order.orderCreator}${order.orderCreatorName ? ` - ${order.orderCreatorName}` : ''})`);
    });

    const deletedIds = draftOrders.map(order => order.id);

    // Delete all CREATING orders
    await prisma.order.deleteMany({
      where: {
        status: 'CREATING',
      },
    });

    console.log(`✅ Đã xóa ${deletedIds.length} đơn đang tạo`);

    // Emit socket events for each orderCreator group
    const groupedByCreator = draftOrders.reduce((acc, order) => {
      const key = `${order.orderCreator || 'STAFF'}_${order.orderCreatorName || 'null'}`;
      if (!acc[key]) {
        acc[key] = {
          orderCreator: (order.orderCreator || 'STAFF') as 'STAFF' | 'CUSTOMER',
          orderCreatorName: order.orderCreatorName,
          ids: [],
        };
      }
      acc[key].ids.push(order.id);
      return acc;
    }, {} as Record<string, { orderCreator: 'STAFF' | 'CUSTOMER'; orderCreatorName: string | null; ids: string[] }>);

    // Emit socket events (if socket.io is initialized)
    Object.values(groupedByCreator).forEach((group) => {
      if (group.ids.length > 0) {
        emitDraftOrdersDeleted(group.ids, group.orderCreator, group.orderCreatorName);
      }
    });

    console.log('✅ Đã emit socket events để sync với clients');
  } catch (error) {
    console.error('❌ Lỗi khi xóa đơn đang tạo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
clearAllDraftOrders()
  .then(() => {
    console.log('✅ Hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
