import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'lehoangngoclan.3881@gmail.com';
const HOURLY_RATE = 25000; // 25,000 VND per hour

async function main() {
  console.log('🌱 Bắt đầu seed attendance records...\n');

  // 1. Find user by email
  console.log(`🔍 Tìm kiếm user với email: ${TARGET_EMAIL}...`);
  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
  });

  if (!user) {
    console.error(`❌ Không tìm thấy user với email: ${TARGET_EMAIL}`);
    console.log('💡 Vui lòng tạo user trước khi chạy script này.');
    process.exit(1);
  }

  console.log(`✅ Tìm thấy user: ${user.name} (${user.email}) - ID: ${user.id}\n`);

  // 2. Get or create a shift (Ca Sáng: 06:00 - 14:00)
  console.log('⏰ Tìm kiếm shift "Ca Sáng"...');
  let shift = await prisma.shift.findFirst({
    where: {
      name: 'Ca Sáng',
      startTime: '06:00',
      endTime: '14:00',
    },
  });

  if (!shift) {
    console.log('📝 Tạo shift "Ca Sáng" mới...');
    shift = await prisma.shift.create({
      data: {
        name: 'Ca Sáng',
        startTime: '06:00',
        endTime: '14:00',
        description: 'Ca làm việc buổi sáng (8 tiếng)',
        isActive: true,
      },
    });
    console.log(`✅ Đã tạo shift: ${shift.name} (${shift.id})\n`);
  } else {
    console.log(`✅ Tìm thấy shift: ${shift.name} (${shift.id})\n`);
  }

  // 3. Delete existing check-ins for this user in the past 28 days (to avoid duplicates)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 28);

  console.log('🗑️  Xóa check-ins cũ trong 28 ngày qua...');
  const deletedCount = await prisma.shiftCheckIn.deleteMany({
    where: {
      userId: user.id,
      checkInTime: {
        gte: startDate,
      },
    },
  });
  console.log(`✅ Đã xóa ${deletedCount.count} check-ins cũ\n`);

  // 4. Generate 28 days of attendance records
  console.log('📅 Tạo 28 ngày attendance records...');
  const checkIns: Array<{
    shiftId: string;
    userId: string;
    checkInTime: Date;
    checkOutTime: Date;
    notes?: string;
  }> = [];

  // Generate dates for the past 28 days (consecutive)
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Determine if this is a standard day (20 days) or irregular day (8 days)
    // Use modulo to distribute irregular days evenly
    const isStandard = i % 3 !== 0 || i < 8; // First 8 days will have some irregular, then pattern

    let checkInTime: Date;
    let checkOutTime: Date;
    let hours: number;
    let status: string;

    if (isStandard && checkIns.filter(c => {
      const checkInDate = new Date(c.checkInTime);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === date.getTime();
    }).length < 20) {
      // Standard day: Full 8 hours (06:00 - 14:00)
      checkInTime = new Date(date);
      checkInTime.setHours(6, 0, 0, 0); // 06:00

      checkOutTime = new Date(date);
      checkOutTime.setHours(14, 0, 0, 0); // 14:00

      hours = 8;
      status = 'Standard';
    } else {
      // Irregular day: 4 to 6 hours (late check-in or early check-out)
      const irregularHours = 4 + Math.floor(Math.random() * 3); // 4, 5, or 6 hours
      const lateStart = Math.floor(Math.random() * 3); // 0, 1, or 2 hours late

      checkInTime = new Date(date);
      checkInTime.setHours(6 + lateStart, Math.floor(Math.random() * 60), 0, 0); // 06:00-08:00

      checkOutTime = new Date(checkInTime);
      checkOutTime.setHours(checkInTime.getHours() + irregularHours, checkInTime.getMinutes(), 0, 0);

      hours = irregularHours;
      status = 'Irregular';
    }

    checkIns.push({
      shiftId: shift.id,
      userId: user.id,
      checkInTime,
      checkOutTime,
      notes: status === 'Irregular' ? `Late check-in or early check-out (${hours} hours)` : null,
    });

    console.log(
      `  ✅ ${date.toLocaleDateString('vi-VN')}: ${checkInTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${checkOutTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} (${hours}h) [${status}]`
    );
  }

  // 5. Insert check-ins into database
  console.log('\n💾 Lưu vào database...');
  await prisma.shiftCheckIn.createMany({
    data: checkIns,
  });

  // 6. Calculate summary
  const totalHours = checkIns.reduce((sum, ci) => {
    const hours = (ci.checkOutTime.getTime() - ci.checkInTime.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  const standardDays = checkIns.filter(ci => {
    const hours = (ci.checkOutTime.getTime() - ci.checkInTime.getTime()) / (1000 * 60 * 60);
    return Math.abs(hours - 8) < 0.5; // Approximately 8 hours
  }).length;

  const irregularDays = checkIns.length - standardDays;
  const estimatedSalary = totalHours * HOURLY_RATE;

  console.log('\n✅ Hoàn tất seed attendance records!\n');
  console.log('📊 Thống kê:');
  console.log(`   - Tổng số ngày: ${checkIns.length}`);
  console.log(`   - Ngày chuẩn (8h): ${standardDays}`);
  console.log(`   - Ngày không chuẩn (4-6h): ${irregularDays}`);
  console.log(`   - Tổng giờ làm việc: ${totalHours.toFixed(2)} giờ`);
  console.log(`   - Lương ước tính (${HOURLY_RATE.toLocaleString('vi-VN')} VND/giờ): ${estimatedSalary.toLocaleString('vi-VN')} VND`);
  console.log(`\n👤 User: ${user.name} (${user.email})`);
  console.log(`⏰ Shift: ${shift.name} (${shift.startTime} - ${shift.endTime})`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed attendance:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




