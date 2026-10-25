
import { createEmailTransporter } from '../config/email.js';

let transporter;

function getTransporter() {
    if (!transporter) {
        transporter = createEmailTransporter();
    }

    return transporter;
}

function getEmailSender() {
    const sender = process.env.EMAIL_FROM?.trim()
        || process.env.SMTP_USER?.trim();

    if (!sender) {
        throw new Error(
            'Email sender is not configured. Set EMAIL_FROM or SMTP_USER.'
        );
    }

    return sender;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };

        return entities[character];
    });
}

async function sendOtpEmail({ email, otp, subject, text, heading, message }) {
    if (typeof email !== 'string' || !email.trim()) {
        throw new Error('A valid recipient email is required.');
    }

    if (typeof otp !== 'string' || !otp.trim()) {
        throw new Error('A valid verification code is required.');
    }

    const safeOtp = escapeHtml(otp.trim());
    const mailer = getTransporter();
    const from = getEmailSender();

    return mailer.sendMail({
        from,
        to: email.trim(),
        subject,
        text: [
            text,
            '',
            `Your code is: ${otp.trim()}`,
            '',
            'This code expires in 10 minutes.',
            message,
        ].join('\n'),
        html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#25231f">
                <h1 style="color:#a88752">NEXORA<span>.</span></h1>
                <h2>${escapeHtml(heading)}</h2>
                <p>${escapeHtml(message)}</p>
                <div style="padding:18px;background:#f5f0e8;border-radius:10px;text-align:center;font-size:30px;letter-spacing:8px;font-weight:bold">
                    ${safeOtp}
                </div>
                <p>This code expires in 10 minutes.</p>
            </div>
        `,
    });
}

export async function sendVerificationEmail(email, otp) {
    return sendOtpEmail({
        email,
        otp,
        subject: 'Verify your Nexora account',
        text: 'Welcome to Nexora!',
        heading: 'Verify your email',
        message:
            'If you did not create a Nexora account, you can ignore this email.',
    });
}

export async function sendPasswordResetEmail(email, otp) {
    return sendOtpEmail({
        email,
        otp,
        subject: 'Reset your Nexora password',
        text: 'We received a request to reset your Nexora password.',
        heading: 'Password reset',
        message:
            'If you did not request a password reset, you can ignore this email.',
    });
}
