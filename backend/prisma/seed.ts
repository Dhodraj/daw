/**
 * Seed script to populate demo data for testing
 *
 * Run with: npx ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Demo tenant ID
const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const SCHEMA_NAME = 'tenant_default';

// Bangalore coordinates for demo
const BANGALORE_CENTER = { lat: 12.9716, lng: 77.5946 };

// Generate random location around a center point
function randomLocation(center: { lat: number; lng: number }, radiusKm: number) {
  const radiusInDegrees = radiusKm / 111; // Rough conversion
  const lat = center.lat + (Math.random() - 0.5) * 2 * radiusInDegrees;
  const lng = center.lng + (Math.random() - 0.5) * 2 * radiusInDegrees;
  return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
}

// Vehicle types
const VEHICLE_TYPES = ['ECONOMY', 'COMFORT', 'PREMIUM', 'XL'];

// Indian names for demo
const FIRST_NAMES = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Suresh', 'Kavita',
  'Rajesh', 'Deepika', 'Arun', 'Meera', 'Kiran', 'Nisha', 'Sanjay', 'Pooja',
  'Manoj', 'Ritu', 'Venkat', 'Lakshmi'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Iyer', 'Nair', 'Menon',
  'Gupta', 'Verma', 'Rao', 'Pillai', 'Joshi', 'Desai', 'Kulkarni', 'Bhat'
];

// Generate a random Indian name
function randomName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

// Generate a random Indian phone number
function randomPhone() {
  const prefixes = ['98', '97', '96', '95', '94', '93', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80', '79', '78', '77', '76', '75', '74', '73', '72', '71', '70'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `+91${prefix}${suffix}`;
}

// Generate vehicle number (Karnataka format)
function randomVehicleNumber() {
  const districts = ['KA01', 'KA02', 'KA03', 'KA04', 'KA05', 'KA09', 'KA50', 'KA51', 'KA52', 'KA53'];
  const district = districts[Math.floor(Math.random() * districts.length)];
  const series = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                 String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${district}${series}${number}`;
}

async function seedTenant() {
  console.log('Creating/verifying tenant...');

  // Check if tenant exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: TENANT_ID }
  });

  if (!existingTenant) {
    await prisma.tenant.create({
      data: {
        id: TENANT_ID,
        name: 'Demo Tenant',
        schemaName: SCHEMA_NAME,
        region: 'ap-south-1',
        config: {
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
        status: 'ACTIVE',
      }
    });
    console.log('✓ Created demo tenant');
  } else {
    console.log('✓ Tenant already exists');
  }
}

async function seedRiders(count: number = 10) {
  console.log(`Creating ${count} demo riders...`);

  // Get prisma client for tenant schema
  const tenantPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.replace('schema=public', `schema=${SCHEMA_NAME}`) ||
             `postgresql://ridehailing:ridehailing_pass@localhost:5432/ridehailing?schema=${SCHEMA_NAME}`
      }
    }
  });

  const riders = [];
  for (let i = 0; i < count; i++) {
    const rider = await tenantPrisma.rider.create({
      data: {
        name: randomName(),
        phone: randomPhone(),
        email: `rider${i + 1}@demo.com`,
        defaultPaymentMethod: ['CASH', 'CARD', 'WALLET'][Math.floor(Math.random() * 3)],
        rating: parseFloat((4 + Math.random()).toFixed(1)),
      }
    });
    riders.push(rider);
  }

  await tenantPrisma.$disconnect();
  console.log(`✓ Created ${riders.length} riders`);
  return riders;
}

async function seedDrivers(count: number = 20) {
  console.log(`Creating ${count} demo drivers...`);

  const tenantPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.replace('schema=public', `schema=${SCHEMA_NAME}`) ||
             `postgresql://ridehailing:ridehailing_pass@localhost:5432/ridehailing?schema=${SCHEMA_NAME}`
      }
    }
  });

  const drivers = [];
  for (let i = 0; i < count; i++) {
    const location = randomLocation(BANGALORE_CENTER, 10); // Within 10km of center
    const vehicleType = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];

    const driver = await tenantPrisma.driver.create({
      data: {
        name: randomName(),
        phone: randomPhone(),
        email: `driver${i + 1}@demo.com`,
        vehicleNumber: randomVehicleNumber(),
        vehicleType,
        status: Math.random() > 0.3 ? 'AVAILABLE' : 'OFFLINE', // 70% available
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        acceptanceRate: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
      }
    });
    drivers.push({ ...driver, location });
  }

  await tenantPrisma.$disconnect();
  console.log(`✓ Created ${drivers.length} drivers`);
  return drivers;
}

async function main() {
  console.log('🌱 Starting seed process...\n');

  try {
    // Seed tenant
    await seedTenant();

    // Seed riders
    const riders = await seedRiders(10);
    console.log('\nSample Rider IDs:');
    riders.slice(0, 3).forEach(r => console.log(`  - ${r.id} (${r.name})`));

    // Seed drivers
    const drivers = await seedDrivers(20);
    console.log('\nSample Driver IDs:');
    drivers.slice(0, 3).forEach(d => console.log(`  - ${d.id} (${d.name})`));

    console.log('\n✅ Seed completed successfully!');
    console.log('\nDemo Tenant ID:', TENANT_ID);
    console.log('\nYou can now use these IDs for testing the API.');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
