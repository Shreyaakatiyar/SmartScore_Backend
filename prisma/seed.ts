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
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env"
    );
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin created successfully: ${admin.email}`);
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });