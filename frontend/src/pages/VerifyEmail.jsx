
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authservice';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const redirectTimerRef = useRef(null);
    const cooldownTimerRef = useRef(null);

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (!location.state?.email) {
            const savedEmail = sessionStorage.getItem('nexora_pending_email');
            if (savedEmail) setEmail(savedEmail);
        } else {
            sessionStorage.setItem(
                'nexora_pending_email',
                location.state.email
            );
        }
    }, [location.state]);

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
        setError('');
        setMessage('');

        const trimmedEmail = email.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!/^\d{6}$/.test(otp.trim())) {
            setError('Please enter the 6-digit OTP.');
            return;
        }

        try {
            setSubmitting(true);

            await authService.verifyEmail(trimmedEmail, otp.trim());

            sessionStorage.removeItem('nexora_pending_email');
            setMessage(
                'Email verified successfully! Redirecting to sign in...'
            );

            redirectTimerRef.current = setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1200);
        } catch (requestError) {
            setError(
                requestError.message || 'Verification failed. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResend() {
        if (resending || cooldown > 0) return;

        setError('');
        setMessage('');

        const trimmedEmail = email.trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError(
                'Enter a valid email address before requesting another OTP.'
            );
            return;
        }

        try {
            setResending(true);

            await authService.resendOtp(trimmedEmail);

            setOtp('');
            setCooldown(RESEND_COOLDOWN_SECONDS);
            setMessage('A new OTP has been requested. Check your email.');
        } catch (requestError) {
            setError(
                requestError.message || 'Unable to resend OTP. Please try again.'
            );
        } finally {
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
                                event.target.value.replace(/\D/g, '').slice(0, 6)
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
                        disabled={submitting}
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
                        disabled={resending || cooldown > 0}
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
