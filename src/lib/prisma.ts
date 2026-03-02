import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const url = process.env.DATABASE_URL ?? "file:dev.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

  console.log("[prisma] Connecting with URL:", url.substring(0, 30) + "...");

  const adapter = new PrismaLibSql({
    url,
    authToken,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
