import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Contract from '../models/Contract.js';
import Shipment from '../models/Shipment.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://testuser1:testuser1%401234@pbr.lfdso1z.mongodb.net/?retryWrites=true&w=majority&appName=PBR';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Contract.deleteMany({});
    await Shipment.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const users = [
      {
        email: 'admin@pbrmonitoring.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        email: 'user@pbrmonitoring.com',
        password: 'user123',
        role: 'user'
      }
    ];

    await User.insertMany(users);
    console.log('👥 Created users');

    // Create contracts
    const contracts = [
      {
        contractId: 'PBR-2024-001',
        deviceCount: 100,
        batteriesShipped: 50,
        threshold: 120,
        isLocked: false,
        notificationsSent: []
      },
      {
        contractId: 'PBR-2024-002',
        deviceCount: 200,
        batteriesShipped: 195,
        threshold: 240,
        isLocked: false,
        notificationsSent: [
          {
            email: 'stakeholder@company.com',
            timestamp: new Date(Date.now() - 3600000),
            message: 'Threshold warning: 80% reached'
          }
        ]
      },
      {
        contractId: 'PBR-2024-003',
        deviceCount: 150,
        batteriesShipped: 180,
        threshold: 180,
        isLocked: true,
        notificationsSent: [
          {
            email: 'stakeholder@company.com',
            timestamp: new Date(Date.now() - 1800000),
            message: 'Contract limit reached - BLOCKED'
          }
        ]
      }
    ];

    await Contract.insertMany(contracts);
    console.log('📋 Created contracts');

    // Create shipments
    const shipments = [
      {
        shipmentId: 'SHP-000001',
        contractId: 'PBR-2024-001',
        batteriesShipped: 25,
        timestamp: new Date(Date.now() - 7200000),
        status: 'APPROVED',
        initiatedBy: 'system.auto',
        processedAt: new Date(Date.now() - 7200000)
      },
      {
        shipmentId: 'SHP-000002',
        contractId: 'PBR-2024-002',
        batteriesShipped: 15,
        timestamp: new Date(Date.now() - 5400000),
        status: 'APPROVED',
        initiatedBy: 'john.doe',
        processedAt: new Date(Date.now() - 5400000)
      },
      {
        shipmentId: 'SHP-000003',
        contractId: 'PBR-2024-003',
        batteriesShipped: 30,
        timestamp: new Date(Date.now() - 3600000),
        status: 'BLOCKED',
        initiatedBy: 'jane.smith',
        processedAt: new Date(Date.now() - 3600000),
        blockReason: 'Exceeds contract threshold'
      },
      {
        shipmentId: 'SHP-000004',
        contractId: 'PBR-2024-001',
        batteriesShipped: 25,
        timestamp: new Date(Date.now() - 1800000),
        status: 'APPROVED',
        initiatedBy: 'system.auto',
        processedAt: new Date(Date.now() - 1800000)
      },
      {
        shipmentId: 'SHP-000005',
        contractId: 'PBR-2024-002',
        batteriesShipped: 10,
        timestamp: new Date(Date.now() - 900000),
        status: 'PENDING',
        initiatedBy: 'mike.wilson'
      }
    ];

    await Shipment.insertMany(shipments);
    console.log('📦 Created shipments');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@pbrmonitoring.com / admin123');
    console.log('User:  user@pbrmonitoring.com / user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedData();