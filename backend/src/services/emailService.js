
import { createEmailTransporter } from '../config/email.js';

let transporter;

function getTransporter() {
    if (!transporter) {
        transporter = createEmailTransporter();
    }

    return transporter;
}

function getEmailSender() {
    return process.env.EMAIL_FROM || process.env.SMTP_USER;
}

export async function sendVerificationEmail(email, otp) {
    const mailer = getTransporter();

    return mailer.sendMail({
        from: getEmailSender(),
        to: email,
        subject: 'Verify your Nexora account',
        text: [
            'Welcome to Nexora!',
            '',
            `Your email verification code is: ${otp}`,
            '',
            'This code expires in 10 minutes.',
            'If you did not create a Nexora account, you can ignore this email.',
        ].join('\n'),
        html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#25231f">
        <h1 style="color:#a88752">NEXORA<span>.</span></h1>
        <h2>Verify your email</h2>
        <p>Use the verification code below to activate your account.</p>
        <div style="padding:18px;background:#f5f0e8;border-radius:10px;text-align:center;font-size:30px;letter-spacing:8px;font-weight:bold">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not create a Nexora account, you can ignore this email.</p>
      </div>
    `,
    });
}

export async function sendPasswordResetEmail(email, otp) {
    const mailer = getTransporter();

    return mailer.sendMail({
        from: getEmailSender(),
        to: email,
        subject: 'Reset your Nexora password',
        text: [
            'We received a request to reset your Nexora password.',
            '',
            `Your password reset code is: ${otp}`,
            '',
            'This code expires in 10 minutes.',
            'If you did not request a password reset, you can ignore this email.',
        ].join('\n'),
        html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#25231f">
        <h1 style="color:#a88752">NEXORA<span>.</span></h1>
        <h2>Password reset</h2>
        <p>Use this code to continue resetting your password.</p>
        <div style="padding:18px;background:#f5f0e8;border-radius:10px;text-align:center;font-size:30px;letter-spacing:8px;font-weight:bold">
          ${otp}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
    });
}
