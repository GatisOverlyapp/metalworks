import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

let prismaInstance: PrismaClient | null = null;

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:dev.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = createPrisma();
  }
  return prismaInstance;
}

// Lazy proxy so prisma is only initialized on first access
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
