import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Prisma Seed] Starting PostgreSQL database seeding for Sqbe HRMS...');

  const defaultPasswordHash = await bcrypt.hash('demo123', 10);

  // 1. Organizations
  console.log('[Prisma Seed] Seeding organizations...');
  const acroOrg = await prisma.organization.upsert({
    where: { slug: 'acro-corp' },
    update: {},
    create: {
      id: 'org-acro',
      name: 'Acro Corp Global',
      slug: 'acro-corp',
      industry: 'Information Technology & Cloud Services',
      employeeCount: 420,
      activeUsers: 395,
      status: 'Active',
      contactEmail: 'contact@acrocorp.com',
      billingPlan: 'Enterprise',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    },
  });

  const zenithOrg = await prisma.organization.upsert({
    where: { slug: 'zenith-tech' },
    update: {},
    create: {
      id: 'org-zenith',
      name: 'Zenith Tech Labs',
      slug: 'zenith-tech',
      industry: 'FinTech & AI Research',
      employeeCount: 180,
      activeUsers: 172,
      status: 'Active',
      contactEmail: 'admin@zenithtech.io',
      billingPlan: 'Professional',
      logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=120&auto=format&fit=crop&q=80',
    },
  });

  const apexOrg = await prisma.organization.upsert({
    where: { slug: 'apex-retail' },
    update: {},
    create: {
      id: 'org-apex',
      name: 'Apex Retail Solutions',
      slug: 'apex-retail',
      industry: 'Omnichannel E-Commerce',
      employeeCount: 650,
      activeUsers: 610,
      status: 'Active',
      contactEmail: 'hr@apexretail.com',
      billingPlan: 'Enterprise',
      logoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120&auto=format&fit=crop&q=80',
    },
  });

  // 2. Organization Modules
  console.log('[Prisma Seed] Seeding organization modules...');
  const modulesList = ['hr', 'payroll', 'attendance', 'performance', 'recruitment', 'leave', 'ess', 'engagement', 'marketplace', 'expense'];
  for (const org of [acroOrg, zenithOrg, apexOrg]) {
    for (const mod of modulesList) {
      await prisma.organizationModule.upsert({
        where: {
          orgId_moduleId: {
            orgId: org.id,
            moduleId: mod,
          },
        },
        update: {},
        create: {
          orgId: org.id,
          moduleId: mod,
          enabled: true,
        },
      });
    }
  }

  // 3. Departments
  console.log('[Prisma Seed] Seeding departments...');
  const depts = [
    { id: 'dept-acro-eng', orgId: acroOrg.id, name: 'Engineering', code: 'ENG', employeeCount: 180, budgetInr: 45000000 },
    { id: 'dept-acro-hr', orgId: acroOrg.id, name: 'Human Resources', code: 'HR', employeeCount: 22, budgetInr: 8000000 },
    { id: 'dept-acro-fin', orgId: acroOrg.id, name: 'Finance & Accounts', code: 'FIN', employeeCount: 18, budgetInr: 6500000 },
    { id: 'dept-zenith-eng', orgId: zenithOrg.id, name: 'Core AI Platform', code: 'AI-ENG', employeeCount: 95, budgetInr: 25000000 },
  ];

  for (const dept of depts) {
    await prisma.department.upsert({
      where: { orgId_code: { orgId: dept.orgId, code: dept.code } },
      update: {},
      create: dept,
    });
  }

  // 4. Designations
  console.log('[Prisma Seed] Seeding designations...');
  const designations = [
    { id: 'desig-1', orgId: acroOrg.id, title: 'Senior Software Engineer', department: 'Engineering', level: 'IC-3', minExperienceYears: 4 },
    { id: 'desig-2', orgId: acroOrg.id, title: 'Lead Frontend Architect', department: 'Engineering', level: 'IC-5', minExperienceYears: 7 },
    { id: 'desig-3', orgId: acroOrg.id, title: 'Engineering Manager', department: 'Engineering', level: 'M-1', minExperienceYears: 9 },
    { id: 'desig-4', orgId: acroOrg.id, title: 'Head of Human Resources', department: 'Human Resources', level: 'DIR-1', minExperienceYears: 12 },
  ];

  for (const desig of designations) {
    await prisma.designation.upsert({
      where: { id: desig.id },
      update: {},
      create: desig,
    });
  }

  // 5. Work Shifts
  console.log('[Prisma Seed] Seeding work shifts...');
  await prisma.workShift.upsert({
    where: { id: 'shift-gen' },
    update: {},
    create: {
      id: 'shift-gen',
      orgId: acroOrg.id,
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
      breakDurationMinutes: 60,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  });

  // 6. Geofence Locations
  console.log('[Prisma Seed] Seeding geofence locations...');
  await prisma.geofenceLocation.upsert({
    where: { id: 'geo-blr-hq' },
    update: {},
    create: {
      id: 'geo-blr-hq',
      orgId: acroOrg.id,
      name: 'Bengaluru Innovation Tech Park HQ',
      address: 'Outer Ring Road, Bellandur, Bengaluru 560103',
      latitude: 12.9279,
      longitude: 77.6271,
      radiusMeters: 250,
      policy: 'Allow with Warning',
      isRemoteAllowed: true,
    },
  });

  // 7. Employees
  console.log('[Prisma Seed] Seeding employees...');
  const employeesData = [
    {
      id: 'emp-acro-101',
      orgId: acroOrg.id,
      employeeCode: 'EMP-101',
      firstName: 'Priya',
      lastName: 'Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      email: 'priya.sharma@sqbehrms.com',
      phone: '+91 98765 43210',
      department: 'Human Resources',
      designation: 'Head of Human Resources',
      employmentType: 'Full-Time',
      joiningDate: '2022-03-01',
      location: 'Bengaluru HQ',
      status: 'Active',
      annualCtc: 3200000,
      monthlyGross: 266667,
    },
    {
      id: 'emp-acro-102',
      orgId: acroOrg.id,
      employeeCode: 'EMP-102',
      firstName: 'Vikram',
      lastName: 'Aditya',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      email: 'vikram.aditya@sqbehrms.com',
      phone: '+91 98765 43211',
      department: 'Engineering',
      designation: 'Engineering Manager',
      employmentType: 'Full-Time',
      joiningDate: '2021-06-15',
      location: 'Bengaluru HQ',
      status: 'Active',
      annualCtc: 4200000,
      monthlyGross: 350000,
    },
    {
      id: 'emp-acro-103',
      orgId: acroOrg.id,
      employeeCode: 'EMP-103',
      firstName: 'Rohit',
      lastName: 'Verma',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      email: 'rohit.verma@sqbehrms.com',
      phone: '+91 98765 43212',
      department: 'Engineering',
      designation: 'Lead Frontend Architect',
      employmentType: 'Full-Time',
      joiningDate: '2022-01-10',
      location: 'Bengaluru HQ',
      status: 'Active',
      annualCtc: 2800000,
      monthlyGross: 233333,
    },
    {
      id: 'emp-acro-104',
      orgId: acroOrg.id,
      employeeCode: 'EMP-104',
      firstName: 'Sneha',
      lastName: 'Patel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'sneha.patel@sqbehrms.com',
      phone: '+91 98765 43213',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      employmentType: 'Full-Time',
      joiningDate: '2023-05-02',
      location: 'Bengaluru HQ',
      status: 'Active',
      annualCtc: 1800000,
      monthlyGross: 150000,
    },
    {
      id: 'emp-zenith-201',
      orgId: zenithOrg.id,
      employeeCode: 'ZEN-201',
      firstName: 'Kavita',
      lastName: 'Rao',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      email: 'admin@zenithtech.io',
      phone: '+91 99887 76655',
      department: 'People Operations',
      designation: 'VP People Operations',
      employmentType: 'Full-Time',
      joiningDate: '2023-06-20',
      location: 'Hyderabad Tech Center',
      status: 'Active',
      annualCtc: 3600000,
      monthlyGross: 300000,
    },
  ];

  for (const emp of employeesData) {
    await prisma.employee.upsert({
      where: { orgId_employeeCode: { orgId: emp.orgId, employeeCode: emp.employeeCode } },
      update: {},
      create: emp,
    });
  }

  // 8. Users & Authentication
  console.log('[Prisma Seed] Seeding user accounts...');
  const usersData = [
    {
      id: 'usr-superadmin',
      email: 'superadmin@sqbehrms.com',
      passwordHash: defaultPasswordHash,
      name: 'Alex Vance',
      role: 'Super Admin',
      orgId: acroOrg.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      designation: 'Global Platform Director',
      department: 'Executive Governance',
    },
    {
      id: 'usr-admin-priya',
      email: 'priya.sharma@sqbehrms.com',
      passwordHash: defaultPasswordHash,
      name: 'Priya Sharma',
      role: 'Admin',
      orgId: acroOrg.id,
      employeeId: 'emp-acro-101',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      designation: 'Head of Human Resources',
      department: 'Human Resources',
    },
    {
      id: 'usr-mgr-vikram',
      email: 'vikram.aditya@sqbehrms.com',
      passwordHash: defaultPasswordHash,
      name: 'Vikram Aditya',
      role: 'Manager',
      orgId: acroOrg.id,
      employeeId: 'emp-acro-102',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      designation: 'Engineering Manager',
      department: 'Engineering',
    },
    {
      id: 'usr-lead-rohit',
      email: 'rohit.verma@sqbehrms.com',
      passwordHash: defaultPasswordHash,
      name: 'Rohit Verma',
      role: 'Team Lead',
      orgId: acroOrg.id,
      employeeId: 'emp-acro-103',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      designation: 'Lead Frontend Architect',
      department: 'Engineering',
    },
    {
      id: 'usr-exec-sneha',
      email: 'sneha.patel@sqbehrms.com',
      passwordHash: defaultPasswordHash,
      name: 'Sneha Patel',
      role: 'Executive',
      orgId: acroOrg.id,
      employeeId: 'emp-acro-104',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      designation: 'Senior Software Engineer',
      department: 'Engineering',
    },
    {
      id: 'usr-zenith-admin',
      email: 'admin@zenithtech.io',
      passwordHash: defaultPasswordHash,
      name: 'Kavita Rao',
      role: 'Admin',
      orgId: zenithOrg.id,
      employeeId: 'emp-zenith-201',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      designation: 'VP People Operations',
      department: 'People Operations',
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        orgId: u.orgId,
        employeeId: u.employeeId,
        avatar: u.avatar,
        designation: u.designation,
        department: u.department,
        isActive: true,
      },
    });
  }

  console.log('✅ [Prisma Seed] Database seeded successfully with default accounts and sample data!');
}

main()
  .catch((e) => {
    console.error('❌ [Prisma Seed] Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
