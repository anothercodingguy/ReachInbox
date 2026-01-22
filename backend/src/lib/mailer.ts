import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;
let etherealAccount: { user: string; pass: string } | null = null;

/**
 * Initialize the email transporter
 * Uses Ethereal for testing - creates a test account if credentials not provided
 */
export async function initializeMailer(): Promise<void> {
    const user = process.env.ETHEREAL_USER;
    const pass = process.env.ETHEREAL_PASS;

    if (user && pass) {
        etherealAccount = { user, pass };
        console.log('📧 Using provided Ethereal credentials');
    } else {
        // Create a test account on Ethereal
        const testAccount = await nodemailer.createTestAccount();
        etherealAccount = {
            user: testAccount.user,
            pass: testAccount.pass,
        };
        console.log('📧 Created Ethereal test account:', etherealAccount.user);
    }

    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: etherealAccount.user,
            pass: etherealAccount.pass,
        },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');
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
    etherealUrl?: string;
    error?: string;
}

/**
 * Send an email via Ethereal SMTP
 * Returns the Ethereal preview URL on success
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

        // Get the Ethereal preview URL
        const etherealUrl = nodemailer.getTestMessageUrl(info);

        console.log(`✅ Email sent: ${info.messageId}`);
        console.log(`🔗 Preview URL: ${etherealUrl}`);

        return {
            success: true,
            messageId: info.messageId,
            etherealUrl: etherealUrl || undefined,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to send email:', errorMessage);

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Get the current Ethereal account info
 */
export function getEtherealAccount() {
    return etherealAccount;
}

export default { initializeMailer, sendEmail, getEtherealAccount };
