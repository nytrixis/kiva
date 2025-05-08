import { prisma } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

// Extend the PrismaClient type to include sellerProfile
interface ExtendedPrismaClient extends PrismaClient {
  sellerProfile: any;
}

// Cast the prisma client to the extended type
export const extendedPrisma = prisma as ExtendedPrismaClient;
