import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _client!: any;

  // Getters so delegates are resolved at query time, not at construction time.
  // Prisma 7's WASM compiler initialises lazily on first use.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get user(): any { return this._client.user; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get profile(): any { return this._client.profile; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get application(): any { return this._client.application; }

  constructor() {
    // DATABASE_URL is guaranteed to be present here because validateEnv()
    // in main.ts runs (and exits on failure) before NestFactory.create().
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    this._client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    try {
      await this._client.$connect();
      this.logger.log('Database connected');
    } catch (err) {
      this.logger.error(
        'Database connection failed',
        err instanceof Error ? err.message : String(err),
      );
      throw err;
    }
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
  }
}
