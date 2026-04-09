import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly pdf: PdfService,
  ) {}

  create(userId: string, dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: { userId, ...dto },
    });
  }

  findAll(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) throw new ForbiddenException('Access denied');

    return application;
  }

  async generate(userId: string, id: string) {
    const [application, profile] = await Promise.all([
      this.prisma.application.findUnique({ where: { id } }),
      this.prisma.profile.findUnique({ where: { userId } }),
    ]);

    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) throw new ForbiddenException('Access denied');
    if (!profile) throw new BadRequestException('Profile not found. Please complete your profile before generating documents.');

    const { generatedCv, generatedLetter } = await this.ai.generate({
      profile,
      application,
    });

    return this.prisma.application.update({
      where: { id },
      data: {
        generatedCv,
        generatedLetter,
        status: 'GENERATED',
      },
    });
  }

  async exportCvPdf(userId: string, id: string): Promise<{ buffer: Buffer; filename: string }> {
    const [application, profile] = await Promise.all([
      this.prisma.application.findUnique({ where: { id } }),
      this.prisma.profile.findUnique({ where: { userId } }),
    ]);

    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) throw new ForbiddenException('Access denied');
    if (!application.generatedCv) throw new BadRequestException('CV not generated yet. Call /generate first.');

    const buffer = await this.pdf.generateCv(profile?.fullName ?? null, application.generatedCv);
    const name = this.slugName(profile?.fullName);
    return { buffer, filename: `${name}_Lebenslauf.pdf` };
  }

  async exportLetterPdf(userId: string, id: string): Promise<{ buffer: Buffer; filename: string }> {
    const [application, profile] = await Promise.all([
      this.prisma.application.findUnique({ where: { id } }),
      this.prisma.profile.findUnique({ where: { userId } }),
    ]);

    if (!application) throw new NotFoundException('Application not found');
    if (application.userId !== userId) throw new ForbiddenException('Access denied');
    if (!application.generatedLetter) throw new BadRequestException('Letter not generated yet. Call /generate first.');

    const buffer = await this.pdf.generateLetter(profile?.fullName ?? null, application.generatedLetter);
    const name = this.slugName(profile?.fullName);
    return { buffer, filename: `${name}_Motivationsschreiben.pdf` };
  }

  private slugName(fullName?: string | null): string {
    if (!fullName) return 'Bewerber';
    return fullName.trim().replace(/\s+/g, '_');
  }
}
