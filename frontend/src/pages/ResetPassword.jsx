
import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authservice.js';
import {
    isValidEmail,
    isValidPassword,
    passwordsMatch,
    getPasswordRequirements,
} from '../utils/validators.js';

const RESET_EMAIL_KEY = 'nexora_reset_email';

function getStoredEmail() {
    try {
        return sessionStorage.getItem(RESET_EMAIL_KEY) || '';
    } catch {
        return '';
    }
}

function removeStoredEmail() {
    try {
        sessionStorage.removeItem(RESET_EMAIL_KEY);
    } catch {
        // Storage errors should not block a successful password reset.
    }
}

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const submittingRef = useRef(false);

    const [email, setEmail] = useState(
        () => location.state?.email || getStoredEmail()
    );
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const requirements = getPasswordRequirements(password);
    const strength = requirements.filter((item) => item.valid).length;
    const passwordIsValid = isValidPassword(password);

    const strengthLabel =
        password.length === 0
            ? ''
            : password.length > 72
                ? 'Too long'
                : strength === requirements.length
                    ? 'Strong'
                    : strength <= 2
                        ? 'Weak'
                        : strength <= 4
                            ? 'Good'
                            : 'Almost strong';

    const passwordsMatchValue =
        confirmPassword.length > 0 &&
        passwordsMatch(password, confirmPassword);

    async function handleSubmit(event) {
        event.preventDefault();

        if (submittingRef.current) return;

        setError('');

        const normalizedEmail = email.trim().toLowerCase();
        const trimmedOtp = otp.trim();

        if (!isValidEmail(normalizedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!/^\d{6}$/.test(trimmedOtp)) {
            setError('Please enter the 6-digit reset code.');
            return;
        }

        if (!passwordIsValid) {
            setError('Please meet all password requirements.');
            return;
        }

        if (!passwordsMatch(password, confirmPassword)) {
            setError('Passwords do not match.');
            return;
        }

        submittingRef.current = true;
        setSubmitting(true);

        try {
            await authService.resetPassword(
                normalizedEmail,
                trimmedOtp,
                password
            );

            removeStoredEmail();

            navigate('/login', {
                replace: true,
                state: {
                    message:
                        'Password reset successfully. Please sign in.',
                },
            });
        } catch (requestError) {
            setError(
                requestError?.message ||
                'Unable to reset your password. Please try again.'
            );
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    }

    return (
        <section className="login-section">
            <div className="welcome-panel">
                <p className="eyebrow">ACCOUNT RECOVERY</p>

                <h1>
                    A new key
                    <br />
                    to your <span>space.</span>
                </h1>

                <p className="welcome-description">
                    Verify your reset code and create a new password
                    to regain access to your Nexora workspace.
                </p>

                <div className="feature-note">
                    <span className="feature-dot" />
                    A stronger password. A fresh start.
                </div>
            </div>

            <div className="login-card">
                <div className="card-heading">
                    <div className="card-mark">N</div>
                    <p className="eyebrow">RESET PASSWORD</p>
                    <h2>Create new password</h2>
                    <p>
                        Enter your reset code and choose a new password.
                    </p>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
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

                    <label htmlFor="otp">6-digit reset code</label>

                    <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="Enter your reset code"
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

                    <label htmlFor="password">New password</label>

                    <div className="password-wrapper">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setError('');
                            }}
                            required
                        />

                        <button
                            className="password-toggle"
                            type="button"
                            onClick={() =>
                                setShowPassword((previous) => !previous)
                            }
                            aria-label={
                                showPassword
                                    ? 'Hide new password'
                                    : 'Show new password'
                            }
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {password.length > 0 && (
                        <div className="password-strength">
                            <div className="strength-heading">
                                <span>Password strength</span>
                                <span>{strengthLabel}</span>
                            </div>

                            <div
                                className="strength-track"
                                role="progressbar"
                                aria-label="Password requirements met"
                                aria-valuemin={0}
                                aria-valuemax={requirements.length}
                                aria-valuenow={strength}
                            >
                                {requirements.map((item) => (
                                    <span
                                        key={item.label}
                                        className="strength-segment"
                                        style={{
                                            backgroundColor: item.valid
                                                ? '#75bd8b'
                                                : undefined,
                                        }}
                                    />
                                ))}
                            </div>

                            <ul className="password-requirements">
                                {requirements.map((item) => (
                                    <li
                                        key={item.label}
                                        style={{
                                            color: item.valid
                                                ? '#75bd8b'
                                                : undefined,
                                        }}
                                    >
                                        {item.valid ? '✓' : '○'} {item.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <label htmlFor="confirmPassword">
                        Confirm new password
                    </label>

                    <div className="password-wrapper">
                        <input
                            id="confirmPassword"
                            type={
                                showConfirmPassword ? 'text' : 'password'
                            }
                            autoComplete="new-password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(event) => {
                                setConfirmPassword(event.target.value);
                                setError('');
                            }}
                            required
                        />

                        <button
                            className="password-toggle"
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(
                                    (previous) => !previous
                                )
                            }
                            aria-label={
                                showConfirmPassword
                                    ? 'Hide confirmation password'
                                    : 'Show confirmation password'
                            }
                        >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {confirmPassword.length > 0 && (
                        <p
                            className="password-match"
                            style={{
                                color: passwordsMatchValue
                                    ? '#75bd8b'
                                    : '#e58b83',
                            }}
                            role="status"
                        >
                            {passwordsMatchValue
                                ? '✓ Passwords match'
                                : 'Passwords do not match'}
                        </p>
                    )}

                    {error && (
                        <p
                            className="form-message error-message"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        className="sign-in-button"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Resetting password...'
                            : 'Reset password'}
                        {!submitting && <span>↗</span>}
                    </button>
                </form>

                <div className="card-footer">
                    <span>Remember your password?</span>
                    <Link to="/login">Sign in</Link>
                </div>

                <p className="security-note">
                    Your space. Your privacy. Your control.
                </p>
            </div>
        </section>
    );
}

export default ResetPassword;
