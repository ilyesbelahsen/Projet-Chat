import { Injectable, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sesClient: SESClient | null = null;
  private senderEmail: string | null = null;

  constructor() {
    const region = process.env.AWS_REGION;
    this.senderEmail = process.env.SES_SENDER_EMAIL || null;

    if (region && this.senderEmail) {
      this.sesClient = new SESClient({ region });
      this.logger.log(`SES configured with sender: ${this.senderEmail}`);
    } else {
      this.logger.warn('SES not configured - emails will be logged to console');
    }
  }

  async sendPasswordResetEmail(
    toEmail: string,
    resetLink: string,
  ): Promise<boolean> {
    const subject = 'Réinitialisation de votre mot de passe - Cloud Chat';
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 4px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cloud Chat</h1>
          </div>
          <div class="content">
            <h2>Réinitialisation de mot de passe</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe sur Cloud Chat.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">
              ${resetLink}
            </p>
            <div class="warning">
              <strong>Ce lien expire dans 1 heure.</strong><br>
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </div>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement par Cloud Chat.</p>
            <p>Ne répondez pas à cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textBody = `
Réinitialisation de mot de passe - Cloud Chat

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe sur Cloud Chat.

Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :
${resetLink}

Ce lien expire dans 1 heure.
Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

---
Cloud Chat
    `;

    // Si SES n'est pas configuré, on log simplement
    if (!this.sesClient || !this.senderEmail) {
      this.logger.log(`[EMAIL NOT SENT - SES not configured]`);
      this.logger.log(`To: ${toEmail}`);
      this.logger.log(`Subject: ${subject}`);
      this.logger.log(`Reset Link: ${resetLink}`);
      return false;
    }

    try {
      const command = new SendEmailCommand({
        Source: this.senderEmail,
        Destination: {
          ToAddresses: [toEmail],
        },
        Message: {
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: htmlBody,
            },
            Text: {
              Charset: 'UTF-8',
              Data: textBody,
            },
          },
        },
      });

      const response = await this.sesClient.send(command);
      this.logger.log(`Email sent successfully to ${toEmail}, MessageId: ${response.MessageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${toEmail}:`, error);
      // En cas d'erreur SES, on log le lien pour permettre la récupération manuelle
      this.logger.log(`[FALLBACK] Reset link for ${toEmail}: ${resetLink}`);
      return false;
    }
  }
}
