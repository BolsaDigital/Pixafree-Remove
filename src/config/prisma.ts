/* eslint-disable no-var */
import { Prisma, PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

const prismaConfig: Prisma.PrismaClientOptions = {};

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaConfig);
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient(prismaConfig);
  }
  prisma = global.prisma;
}

export default prisma;

declare global {
  var prisma: PrismaClient;
}
