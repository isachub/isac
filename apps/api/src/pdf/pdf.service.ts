import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  async generateCv(fullName: string | null, content: string): Promise<Buffer> {
    return this.buildPdf({
      title: 'Lebenslauf',
      subtitle: fullName ?? '',
      body: content,
    });
  }

  async generateLetter(fullName: string | null, content: string): Promise<Buffer> {
    return this.buildPdf({
      title: 'Motivationsschreiben',
      subtitle: fullName ?? '',
      body: content,
    });
  }

  private buildPdf(opts: { title: string; subtitle: string; body: string }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .text(opts.title, { align: 'left' });

      if (opts.subtitle) {
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor('#555555')
          .text(opts.subtitle, { align: 'left' });
      }

      doc.moveDown(1.5);
      doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#cccccc').stroke();
      doc.moveDown(1);

      // Body
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#000000')
        .text(opts.body, {
          align: 'left',
          lineGap: 4,
        });

      doc.end();
    });
  }
}
