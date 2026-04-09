import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let user: { id: string; email: string };
    try {
      user = await this.prisma.user.create({
        data: { email: dto.email, passwordHash },
      });
    } catch (err: unknown) {
      // P2002 = unique constraint violation (race condition between findUnique and create)
      if ((err as { code?: string })?.code === 'P2002') {
        throw new ConflictException('Email already in use');
      }
      this.logger.error('register: user.create failed', err instanceof Error ? err.message : String(err));
      throw new InternalServerErrorException('Registration failed. Please try again.');
    }

    return this.sign(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.sign(user.id, user.email);
  }

  private sign(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}
