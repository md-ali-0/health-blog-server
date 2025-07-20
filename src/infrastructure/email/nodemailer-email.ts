import { inject, injectable } from 'inversify';
import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../config/config';
import { ILogger } from '../../shared/interfaces/logger.interface';
import { EmailOptions, IEmailService } from './email.interface';

@injectable()
export class NodemailerEmailService implements IEmailService {
  private transporter: Transporter;

  constructor(@inject('ILogger') private logger: ILogger) {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.info(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}