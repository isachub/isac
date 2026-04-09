import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly client: any;

  readonly user: InstanceType<typeof PrismaClient>['user'];
  readonly profile: InstanceType<typeof PrismaClient>['profile'];
  readonly application: InstanceType<typeof PrismaClient>['application'];

  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    this.client = new PrismaClient({ adapter });
    this.user = this.client.user;
    this.profile = this.client.profile;
    this.application = this.client.application;
  }

  async onModuleInit() {
    try {
      await this.client.$connect();
      this.logger.log('Database connected');
    } catch (err) {
      this.logger.error('Database connection failed', err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
