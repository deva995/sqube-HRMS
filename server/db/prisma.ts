import { PrismaClient } from '@prisma/client';
import { config } from '../config';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  const isDev = config.nodeEnv === 'development';

  const client = new PrismaClient({
    log: isDev ? ['warn', 'error'] : ['error'],
  });

  return client;
}

export const prisma: PrismaClient = global.__prismaClient ?? createPrismaClient();

if (config.nodeEnv !== 'production') {
  global.__prismaClient = prisma;
}

/**
 * Checks if the PostgreSQL database connection is alive.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) {
      return false;
    }
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.warn('[Prisma] Database connection test failed or database not reachable:', (error as Error).message);
    return false;
  }
}
