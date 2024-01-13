import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private logger: Logger,
  ) {
    this.logger.log(MailService.name);
  }

  async sendMail(
    emails: string[],
    subject: string,
    html: string,
    attachments?: Record<string, string>[],
  ) {
    for (const email of emails) {
      const info = await this.mailerService.sendMail({
        from: `"Amap"<${process.env.EMAIL_HOST_USER}>`,
        to: email,
        html,
        subject,
        attachments,
      });
      this.logger.log(info);
    }
  }
}
