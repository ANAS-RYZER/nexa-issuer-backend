import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as pug from 'pug';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly brevoApiKey: string;
  private readonly smtpUsername: string;
  private readonly emailFrom: string;
  private readonly templatesPath: string;

  constructor(private readonly configService: ConfigService) {
    this.brevoApiKey = this.configService.get<string>('BREVO_API_KEY') || '';
    this.smtpUsername = this.configService.get<string>('SMTP_USERNAME') || 'NEXA Team';
    this.emailFrom = this.configService.get<string>('EMAIL_FROM') || 'hello@ryzer.app';

    // Support both development (src/templates) and production (dist/templates)
    this.templatesPath = path.join(
      process.cwd(),
      process.env.NODE_ENV === 'production' ? 'dist/templates' : 'src/templates',
    );

    if (!this.brevoApiKey) {
      this.logger.warn('⚠️ BREVO_API_KEY is not set in environment variables');
    } else {
      this.logger.log('✅ Email service configured with Brevo API');
    }
  }

  /**
   * Renders a Pug template with the provided context
   */
  private renderTemplate(templateName: string, context: Record<string, any> = {}): string {
    try {
      const templatePath = path.join(this.templatesPath, `${templateName}.pug`);
      return pug.renderFile(templatePath, context);
    } catch (error: any) {
      this.logger.error(`Error rendering template ${templateName}:`, error.message);
      throw new HttpException(
        `Failed to render email template: ${templateName}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Converts HTML content to plain text
   */
  private htmlToText(htmlContent: string): string {
    return htmlContent.replace(/<[^>]+>/g, '').trim();
  }

  /**
   * Universal email sending method using Brevo API
   */
  async sendEmail(
    email: string,
    subject: string,
    templateName: string,
    context: Record<string, any> = {},
  ): Promise<any> {
    try {
      if (!this.brevoApiKey) {
        this.logger.warn(`[DEV MODE] Email to ${email} - Subject: ${subject}`);
        this.logger.warn(`[DEV MODE] Context: ${JSON.stringify(context)}`);
        return { success: true, devMode: true };
      }

      // Render the template
      const htmlContent = this.renderTemplate(templateName, context);
      const textContent = this.htmlToText(htmlContent);

      // Send email via Brevo API
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: this.smtpUsername,
            email: this.emailFrom,
          },
          to: [{ email }],
          subject,
          htmlContent,
          textContent,
        },
        {
          headers: {
            accept: 'application/json',
            'api-key': this.brevoApiKey,
            'content-type': 'application/json',
          },
        },
      );

      this.logger.log(`✅ Email sent successfully to ${email}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      this.logger.error(`❌ Error sending email to ${email}:`, errorMessage);
      throw new HttpException(
        `Failed to send email: ${errorMessage}`,
        error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send OTP email
   */
  async sendOtpToEmail(email: string, otp: string): Promise<void> {
    if (!this.brevoApiKey) {
      this.logger.warn(`[DEV MODE] OTP for ${email}: ${otp}`);
      return;
    }
    await this.sendEmail(email, 'Your Verification Code', 'otp', { otp });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, context: Record<string, any> = {}): Promise<void> {
    await this.sendEmail(email, 'Welcome to NEXA!', 'welcome', context);
  }
}
