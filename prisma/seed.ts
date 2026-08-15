import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/services/password.service";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const main = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const studentEmail = process.env.TEST_STUDENT_EMAIL;
  const studentPassword = process.env.TEST_STUDENT_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env"
    );
  }

  if (!studentEmail || !studentPassword) {
    throw new Error(
      "TEST_STUDENT_EMAIL and TEST_STUDENT_PASSWORD must be defined in .env"
    );
  }

  // -------------------------
  // Create Admin
  // -------------------------

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${adminEmail}`);
  } else {
    const adminPasswordHash = await hashPassword(
      adminPassword
    );

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "PLATFORM_ADMIN",
        status: "ACTIVE",
      },
    });

    console.log(
      `Admin created successfully: ${admin.email}`
    );
  }

  // -------------------------
  // Create Test Student
  // -------------------------

  const existingStudent = await prisma.user.findUnique({
    where: {
      email: studentEmail,
    },
  });

  if (existingStudent) {
    console.log(
      `Test student already exists: ${studentEmail}`
    );
  } else {
    const studentPasswordHash = await hashPassword(
      studentPassword
    );

    const student = await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash: studentPasswordHash,
        role: "STUDENT",
        status: "ACTIVE",
      },
    });

    console.log(
      `Test student created successfully: ${student.email}`
    );
  }
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });