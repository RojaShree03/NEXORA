
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authservice.js';

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setMessage('');

        const trimmedEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            setSubmitting(true);

            await authService.forgotPassword(trimmedEmail);

            sessionStorage.setItem('nexora_reset_email', trimmedEmail);

            setMessage(
                'If an account exists for this email, password reset instructions will be sent.'
            );

            navigate('/reset-password', {
                state: { email: trimmedEmail },
            });
        } catch (requestError) {
            setError(
                requestError.message ||
                'Unable to process your request. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="login-section">
            <div className="welcome-panel">
                <p className="eyebrow">ACCOUNT RECOVERY</p>

                <h1>
                    A fresh start
                    <br />
                    is <span>possible.</span>
                </h1>

                <p className="welcome-description">
                    It happens. Enter your registered email address to begin
                    recovering access to your Nexora account.
                </p>

                <div className="feature-note">
                    <span className="feature-dot" />
                    Your next chapter is still waiting.
                </div>
            </div>

            <div className="login-card">
                <div className="card-heading">
                    <div className="card-mark">N</div>
                    <p className="eyebrow">PASSWORD RECOVERY</p>
                    <h2>Forgot password?</h2>
                    <p>We'll help you get back into your account.</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Email address</label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setError('');
                            setMessage('');
                        }}
                        required
                    />

                    {error && (
                        <p className="form-message error-message" role="alert">
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
                        {submitting ? 'Sending...' : 'Send reset instructions'}
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

export default ForgotPassword;
