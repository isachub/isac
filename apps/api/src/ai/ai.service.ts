import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { buildCvPrompt, buildLetterPrompt } from './prompts';

export interface ProfileInput {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  dateOfBirth?: Date | null;
  nationality?: string | null;
  summary?: string | null;
  workExperience?: string | null;
  education?: string | null;
  skills?: string | null;
  languages?: string | null;
  certificates?: string | null;
  targetType?: string | null;
}

export interface ApplicationInput {
  targetType: string;
  titleOrRole: string;
  companyOrInstitution: string;
  targetDescription?: string | null;
}

interface GenerateOutput {
  generatedCv: string;
  generatedLetter: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic;
  private readonly model = 'claude-sonnet-4-6';

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = new Anthropic({ apiKey });
  }

  async generate(input: { profile: ProfileInput; application: ApplicationInput }): Promise<GenerateOutput> {
    const cvPrompt = buildCvPrompt(input.profile, input.application);
    const letterPrompt = buildLetterPrompt(input.profile, input.application);

    this.logger.log(
      `Generating documents for: ${input.application.titleOrRole} at ${input.application.companyOrInstitution}`,
    );

    try {
      const [cvResponse, letterResponse] = await Promise.all([
        this.callClaude(cvPrompt),
        this.callClaude(letterPrompt),
      ]);

      return { generatedCv: cvResponse, generatedLetter: letterResponse };
    } catch (error: unknown) {
      // Log the full error so Railway logs show the real cause
      const message = error instanceof Error ? error.message : String(error);
      const status = (error as { status?: number })?.status;
      const errorType = error instanceof Error ? error.constructor.name : typeof error;
      this.logger.error(
        `AI generation failed [${errorType}${status ? ` HTTP ${status}` : ''}]: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Document generation failed. Please try again.');
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const block = message.content[0];
    if (!block || block.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const text = block.text.trim();
    if (!text) {
      throw new Error('Claude returned an empty response');
    }

    return text;
  }
}
