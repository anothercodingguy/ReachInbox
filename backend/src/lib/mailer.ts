import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

/**
 * Initialize the email transporter.
 * Uses Ethereal SMTP for testing.
 */
export async function initializeMailer(): Promise<void> {
    const user = process.env.ETHEREAL_USER;
    const pass = process.env.ETHEREAL_PASS;

    let credentials: { user: string; pass: string };

    if (user && pass) {
        credentials = { user, pass };
    } else {
        const testAccount = await nodemailer.createTestAccount();
        credentials = { user: testAccount.user, pass: testAccount.pass };
        console.log('Created Ethereal test account:', credentials.user);
    }

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: credentials,
    });

    await transporter.verify();
    console.log('SMTP connection verified');
}

export interface SendEmailParams {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send an email via the configured transporter.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
    if (!transporter) {
        throw new Error('Mailer not initialized. Call initializeMailer() first.');
    }

    try {
        const info = await transporter.sendMail({
            from: params.from,
            to: params.to,
            subject: params.subject,
            html: params.html,
        });

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: errorMessage,
        };
    }
}
