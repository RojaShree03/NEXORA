
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authservice';

const RESEND_COOLDOWN_SECONDS = 60;
const PENDING_EMAIL_KEY = 'nexora_pending_email';

function getStoredEmail() {
    try {
        return sessionStorage.getItem(PENDING_EMAIL_KEY) || '';
    } catch {
        return '';
    }
}

function saveStoredEmail(email) {
    try {
        sessionStorage.setItem(PENDING_EMAIL_KEY, email);
    } catch {
        // Verification can still continue if browser storage is unavailable.
    }
}

function removeStoredEmail() {
    try {
        sessionStorage.removeItem(PENDING_EMAIL_KEY);
    } catch {
        // Ignore storage errors; they should not block verification.
    }
}

function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();

    const redirectTimerRef = useRef(null);
    const cooldownTimerRef = useRef(null);
    const verificationInProgressRef = useRef(false);
    const resendInProgressRef = useRef(false);

    const [email, setEmail] = useState(
        () => location.state?.email || getStoredEmail()
    );
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);


    useEffect(() => {
        const stateEmail = location.state?.email;

        if (stateEmail) {
            saveStoredEmail(stateEmail);
        }
    }, [location.state?.email]);

    useEffect(() => {
        if (cooldown <= 0) return undefined;

        cooldownTimerRef.current = setTimeout(() => {
            setCooldown((previous) => Math.max(0, previous - 1));
        }, 1000);

        return () => clearTimeout(cooldownTimerRef.current);
    }, [cooldown]);

    useEffect(() => {
        return () => {
            clearTimeout(cooldownTimerRef.current);
            clearTimeout(redirectTimerRef.current);
        };
    }, []);

    async function handleVerify(event) {
        event.preventDefault();

        if (verificationInProgressRef.current) return;

        setError('');
        setMessage('');

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedOtp = otp.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!/^\d{6}$/.test(trimmedOtp)) {
            setError('Please enter the 6-digit OTP.');
            return;
        }

        verificationInProgressRef.current = true;
        setSubmitting(true);

        try {
            await authService.verifyEmail(trimmedEmail, trimmedOtp);

            removeStoredEmail();
            setOtp('');
            setMessage(
                'Email verified successfully! Redirecting to sign in...'
            );

            redirectTimerRef.current = setTimeout(() => {
                navigate('/login', {
                    replace: true,
                    state: {
                        message: 'Email verified successfully. Please sign in.',
                    },
                });
            }, 1200);
        } catch (requestError) {
            setError(
                requestError?.message ||
                'Verification failed. Please try again.'
            );
        } finally {
            verificationInProgressRef.current = false;
            setSubmitting(false);
        }
    }

    async function handleResend() {
        if (
            resendInProgressRef.current ||
            verificationInProgressRef.current ||
            cooldown > 0
        ) {
            return;
        }

        setError('');
        setMessage('');

        const trimmedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError(
                'Enter a valid email address before requesting another OTP.'
            );
            return;
        }

        resendInProgressRef.current = true;
        setResending(true);

        try {
            await authService.resendOtp(trimmedEmail);

            setOtp('');
            setCooldown(RESEND_COOLDOWN_SECONDS);
            setMessage('A new OTP has been requested. Check your email.');
        } catch (requestError) {
            setError(
                requestError?.message ||
                'Unable to resend OTP. Please try again.'
            );
        } finally {
            resendInProgressRef.current = false;
            setResending(false);
        }
    }

    return (
        <section className="login-section">
            <div className="welcome-panel">
                <p className="eyebrow">ONE LAST STEP</p>

                <h1>
                    Verify your<br />
                    <span>identity.</span>
                </h1>

                <p className="welcome-description">
                    Enter the six-digit verification code sent to your email
                    address to activate your Nexora account.
                </p>

                <div className="feature-note">
                    <span className="feature-dot" />
                    A safer start to your Nexora journey.
                </div>
            </div>

            <div className="login-card">
                <div className="card-heading">
                    <div className="card-mark">N</div>
                    <p className="eyebrow">EMAIL VERIFICATION</p>
                    <h2>Check your inbox</h2>
                    <p>Enter the OTP sent to your email.</p>
                </div>

                <form className="login-form" onSubmit={handleVerify}>
                    <label htmlFor="email">Email address</label>

                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setError('');
                        }}
                        required
                    />

                    <label htmlFor="otp">6-digit verification code</label>

                    <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="Enter your OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => {
                            setOtp(
                                event.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 6)
                            );
                            setError('');
                        }}
                        required
                    />

                    {error && (
                        <p
                            className="form-message error-message"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="form-message" role="status">
                            {message}
                        </p>
                    )}

                    <button
                        className="sign-in-button"
                        type="submit"
                        disabled={submitting || resending}
                    >
                        {submitting ? 'Verifying...' : 'Verify email'}
                        {!submitting && <span>↗</span>}
                    </button>
                </form>

                <div className="card-footer">
                    <span>Didn't receive the code?</span>

                    <button
                        type="button"
                        className="text-action"
                        onClick={handleResend}
                        disabled={
                            resending ||
                            submitting ||
                            cooldown > 0
                        }
                    >
                        {resending
                            ? 'Sending...'
                            : cooldown > 0
                                ? `Resend OTP in ${cooldown}s`
                                : 'Resend OTP'}
                    </button>
                </div>

                <p className="security-note">
                    <Link to="/register">Back to registration</Link>
                </p>
            </div>
        </section>
    );
}

export default VerifyEmail;
