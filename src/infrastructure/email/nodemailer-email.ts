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
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });

    this.transporter.verify()
      .then(() => this.logger.info('SMTP server is ready to take our messages'))
      .catch(error => this.logger.error('SMTP server verification failed', error));
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `Health Blog <${config.email.from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.info(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Failed to send email', error);
      // In a real app, you might want to re-throw or handle this more gracefully
      throw new Error('Email sending failed.');
    }
  }
}
