import { prisma } from '@/lib/db';
import { PrismaClient } from '@prisma/client';

import { Prisma } from '@prisma/client';

interface ExtendedPrismaClient extends PrismaClient {
  sellerProfile: Prisma.SellerProfileDelegate;
}
// Cast the prisma client to the extended type
export const extendedPrisma = prisma as ExtendedPrismaClient;
