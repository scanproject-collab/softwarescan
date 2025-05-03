import dotenv from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import path from 'path';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Attempting to create admin user...');

    const adminEmail = 'webamag277@birige.com';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log('Admin user already exists in database');

      // If the user exists but is pending or doesn't have a proper role, update it
      if (existingUser.isPending || !existingUser.password) {
        const hashedPassword = await bcrypt.hash('Weba123', 10);

        const updatedUser = await prisma.user.update({
          where: { email: adminEmail },
          data: {
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN' as Role,
            isPending: false,
            updatedAt: new Date()
          }
        });

        console.log('Admin user updated:', updatedUser.email);
      }

      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('Weba123', 10);

    const newUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN' as Role,
        isPending: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Admin user created successfully:', newUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createAdminUser(); 