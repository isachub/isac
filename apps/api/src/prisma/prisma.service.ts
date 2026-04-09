import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const client = new PrismaClient({ adapter });

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly user = client.user;
  readonly profile = client.profile;
  readonly application = client.application;

  async onModuleInit() {
    await client.$connect();
  }

  async onModuleDestroy() {
    await client.$disconnect();
  }
}
