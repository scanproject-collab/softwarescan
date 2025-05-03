require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const userEmail = 'webamag277@birige.com';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (existingUser) {
      console.log('Admin user already exists!');
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('Weba123', 10);

    const newUser = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isPending: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Admin user created successfully:', newUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 