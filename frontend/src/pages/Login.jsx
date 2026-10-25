
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            setError('Please enter your email address and password.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 8) {
            setError('Password must contain at least 8 characters.');
            return;
        }

        try {
            setSubmitting(true);

            await login({
                email: trimmedEmail,
                password,
                rememberMe,
            });

            const destination =
                location.state?.from?.pathname || '/dashboard';

            navigate(destination, { replace: true });
        } catch (requestError) {
            setError(
                requestError.message ||
                'Unable to sign in. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="login-section">
            <div className="welcome-panel">
                <p className="eyebrow">WELCOME TO NEXORA</p>

                <h1>
                    A better space
                    <br />
                    for your <span>next move.</span>
                </h1>

                <p className="welcome-description">
                    Bring your work, ideas, and ambitions together
                    in one thoughtfully designed workspace.
                </p>

                <div className="feature-note">
                    <span className="feature-dot" />
                    A little more focus. A lot more possibility.
                </div>
            </div>

            <div className="login-card">
                <div className="card-heading">
                    <p className="eyebrow">
                        YOUR JOURNEY STARTS HERE
                    </p>
                    <h2>Welcome back</h2>
                    <p>Sign in to continue to your workspace.</p>
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
                        }}
                        aria-invalid={Boolean(error)}
                    />

                    <div className="password-heading">
                        <label htmlFor="password">Password</label>
                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    <div className="password-wrapper">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setError('');
                            }}
                            aria-invalid={Boolean(error)}
                        />

                        <button
                            className="password-toggle"
                            type="button"
                            onClick={() =>
                                setShowPassword((previous) => !previous)
                            }
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    <label className="remember-option">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) =>
                                setRememberMe(event.target.checked)
                            }
                        />
                        <span>Remember me</span>
                    </label>

                    <div
                        className="login-error-slot"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {error && (
                            <p className="form-message error-message" role="alert">
                                {error}
                            </p>
                        )}
                    </div>

                    <button
                        className="sign-in-button"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Signing in...' : 'Sign in'}
                        {!submitting && <span>↗</span>}
                    </button>
                </form>

                <div className="card-footer">
                    <span>New to Nexora?</span>
                    <Link to="/register">Create an account</Link>
                </div>

                <p className="security-note">
                    Your space. Your privacy. Your control.
                </p>
            </div>
        </section>
    );
}

export default Login;
