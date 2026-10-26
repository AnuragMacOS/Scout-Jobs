const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Scout database seeding...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@scout.app';
  const adminRawPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
  const passwordHash = await bcrypt.hash(adminRawPassword, 12);

  // 1. Upsert Admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'admin',
    },
    create: {
      firstName: 'Admin',
      lastName: 'Scout',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      rollNo: 'ADMIN-001',
      mobile: '9876543210',
    },
  });

  console.log(`✅ Admin account configured: ${admin.email}`);

  // 2. Demo Jobs
  const demoJobs = [
    {
      title: 'Senior Software Engineer',
      companyName: 'HCLTech',
      location: 'PAN India',
      jobType: 'FTE',
      batchYear: 2027,
      minBtechCgpa: 6.0,
      minTenthPct: 60.0,
      minTwelfthPct: 60.0,
      fteCtcLpa: 10,
      description:
        'HCLTech is looking for passionate campus graduates for software engineering positions. You will work on enterprise cloud solutions, distributed databases, and high-availability client platforms. Training provided in full-stack architecture.',
      status: 'open',
      postedBy: admin.id,
    },
    {
      title: 'SDE / APM / UX',
      companyName: 'Bachatt',
      location: 'Gurugram',
      jobType: 'SIX_MONTH_INTERN_FTE',
      batchYear: 2027,
      minBtechCgpa: 8.0,
      minTenthPct: 75.0,
      minTwelfthPct: 75.0,
      internStipendMonthly: 50000,
      fteCtcLpa: 24,
      description:
        'Bachatt is a high-growth fintech startup. We are hiring software engineers, associate product managers, and UX specialists. Fast iteration, high ownership, modern tech stack, and direct mentorship from industry veterans.',
      status: 'open',
      postedBy: admin.id,
    },
    {
      title: 'Backend Engineer (Go / Java)',
      companyName: 'CRED',
      location: 'Bengaluru',
      jobType: 'FTE',
      batchYear: 2027,
      minBtechCgpa: 7.5,
      minTenthPct: 70.0,
      minTwelfthPct: 70.0,
      fteCtcLpa: 32,
      description:
        'CRED is looking for stellar engineers to join our core transaction and security systems. You will build microservices that handle financial scale with 99.999% uptime, latency under 50ms, and rigorous event-driven design.',
      status: 'open',
      postedBy: admin.id,
    },
    {
      title: 'Software Development Intern',
      companyName: 'Razorpay',
      location: 'Bengaluru',
      jobType: 'INTERN',
      batchYear: 2027,
      minBtechCgpa: 7.0,
      minTenthPct: 70.0,
      minTwelfthPct: 70.0,
      internStipendMonthly: 65000,
      fteCtcLpa: 22,
      description:
        'Join the Razorpay payments team for a 6-month winter internship with potential Pre-Placement Offer (PPO). Work alongside senior engineers building APIs that power digital commerce for millions of Indian merchants.',
      status: 'open',
      postedBy: admin.id,
    },
    {
      title: 'Frontend & Product Engineer',
      companyName: 'Zomato',
      location: 'Gurugram',
      jobType: 'PPO',
      batchYear: 2027,
      minBtechCgpa: 7.0,
      minTenthPct: 65.0,
      minTwelfthPct: 65.0,
      internStipendMonthly: 45000,
      fteCtcLpa: 18,
      description:
        'Craft delightful consumer experiences on web and mobile for Zomato & Blinkit. Requires strong fundamentals in JavaScript/TypeScript, React, performance optimization, and clean component architecture.',
      status: 'open',
      postedBy: admin.id,
    },
  ];

  for (const job of demoJobs) {
    const existing = await prisma.job.findFirst({
      where: {
        title: job.title,
        companyName: job.companyName,
      },
    });

    if (!existing) {
      await prisma.job.create({ data: job });
      console.log(`➕ Created job: ${job.title} at ${job.companyName}`);
    } else {
      console.log(`ℹ️ Job already exists: ${job.title} at ${job.companyName}`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
