import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create office locations
    console.log('📍 Creating office locations...');

    const office1 = await prisma.officeLocation.upsert({
        where: { id: 'office-1' },
        update: {},
        create: {
            id: 'office-1',
            name: 'Main Office - Phnom Penh',
            latitude: 11.556374,
            longitude: 104.928207,
            radius: 50,
            isActive: true,
        },
    });

    const office2 = await prisma.officeLocation.upsert({
        where: { id: 'office-2' },
        update: {},
        create: {
            id: 'office-2',
            name: 'Branch Office - Siem Reap',
            latitude: 13.362922,
            longitude: 103.860897,
            radius: 50,
            isActive: true,
        },
    });

    console.log('✅ Office locations created:', office1.name, office2.name);

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@tracking.com' },
        update: {},
        create: {
            email: 'admin@tracking.com',
            password: hashedAdminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            position: 'System Administrator',
            department: 'IT',
            isActive: true,
        },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create staff users
    console.log('👥 Creating staff users...');
    const hashedStaffPassword = await bcrypt.hash('staff123', 10);

    const staffUser1 = await prisma.user.upsert({
        where: { email: 'staff1@tracking.com' },
        update: {},
        create: {
            email: 'staff1@tracking.com',
            password: hashedStaffPassword,
            firstName: 'Sokha',
            lastName: 'Chan',
            role: 'STAFF',
            position: 'Project Officer',
            department: 'Operations',
            isActive: true,
        },
    });

    const staffUser2 = await prisma.user.upsert({
        where: { email: 'staff2@tracking.com' },
        update: {},
        create: {
            email: 'staff2@tracking.com',
            password: hashedStaffPassword,
            firstName: 'Dara',
            lastName: 'Kem',
            role: 'STAFF',
            position: 'Field Coordinator',
            department: 'Programs',
            isActive: true,
        },
    });

    console.log('✅ Staff users created:', staffUser1.email, staffUser2.email);

    // Create sample attendance records for staff1
    console.log('📝 Creating sample attendance records...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance1 = await prisma.attendanceRecord.create({
        data: {
            userId: staffUser1.id,
            officeId: office1.id,
            attendanceType: 'CHECK_IN_AM',
            latitude: office1.latitude,
            longitude: office1.longitude,
            status: 'Validated',
            timestamp: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8 AM
        },
    });

    const attendance2 = await prisma.attendanceRecord.create({
        data: {
            userId: staffUser1.id,
            officeId: office1.id,
            attendanceType: 'CHECK_OUT_AM',
            latitude: office1.latitude,
            longitude: office1.longitude,
            status: 'Validated',
            timestamp: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        },
    });

    console.log('✅ Sample attendance records created:', attendance1.id, attendance2.id);

    // Create sample leave request
    console.log('🏖️ Creating sample leave request...');
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const leaveRequest = await prisma.leaveRequest.create({
        data: {
            userId: staffUser1.id,
            startDate: nextWeek,
            endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
            reason: 'Personal leave',
            status: 'PENDING',
        },
    });

    console.log('✅ Sample leave request created:', leaveRequest.id);

    // Create sample mission request
    console.log('🚗 Creating sample mission request...');
    const missionRequest = await prisma.missionRequest.create({
        data: {
            userId: staffUser2.id,
            title: 'Field Visit - Kampong Cham',
            description: 'Site visit to project beneficiaries in Kampong Cham province',
            startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
        },
    });

    console.log('✅ Sample mission request created:', missionRequest.id);

    // Create sample work plan
    console.log('📋 Creating sample work plan...');
    const workPlan = await prisma.workPlan.create({
        data: {
            userId: staffUser1.id,
            title: 'November 2025 Monthly Report',
            description: 'Prepare and submit monthly activity report',
            dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: 'IN_PROGRESS',
            progress: 50,
            achievement: 'Data collection completed',
            output: 'Draft report prepared',
        },
    });

    console.log('✅ Sample work plan created:', workPlan.id);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📌 Test Credentials:');
    console.log('   Admin: admin@tracking.com / admin123');
    console.log('   Staff 1: staff1@tracking.com / staff123');
    console.log('   Staff 2: staff2@tracking.com / staff123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
