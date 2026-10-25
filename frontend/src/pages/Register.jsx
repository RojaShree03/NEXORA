
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authservice.js';
import {
    validateRegistration,
    getPasswordRequirements,
} from '../utils/validators.js';

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const passwordRequirements = getPasswordRequirements(password);
    const passedRequirements = passwordRequirements.filter(
        (requirement) => requirement.valid
    ).length;

    const strengthLabel =
        !password ? '' :
            passedRequirements <= 2 ? 'Weak' :
                passedRequirements <= 4 ? 'Medium' : 'Strong';

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');

        const userData = {
            name: name.trim(),
            email: email.trim(),
            password,
            confirmPassword,
        };

        const validation = validateRegistration(userData);

        if (validation) {
            setError(validation);
            return;
        }

        try {
            setSubmitting(true);

            await authService.register({
                name: userData.name,
                email: userData.email,
                password: userData.password,
            });

            navigate('/verify-email', {
                state: { email: userData.email },
            });
        } catch (requestError) {
            setError(
                requestError.message ||
                'Unable to create your account. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="login-section">
            <div className="welcome-panel">
                <p className="eyebrow">JOIN NEXORA</p>

                <h1>
                    Your next chapter
                    <br />
                    starts <span>here.</span>
                </h1>

                <p className="welcome-description">
                    Create your account and build a more focused, organized workspace
                    for your ideas and ambitions.
                </p>

                <div className="feature-note">
                    <span className="feature-dot" />
                    One account. A fresh beginning.
                </div>
            </div>

            <div className="login-card">
                <div className="card-heading">
                    <div className="card-mark">N</div>
                    <p className="eyebrow">GET STARTED</p>
                    <h2>Create account</h2>
                    <p>Enter your details to join Nexora.</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        autoComplete="name"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            setError('');
                        }}
                        required
                    />

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
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <div className="password-wrapper">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            autoComplete="new-password"
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
                            onClick={() => setShowPassword((previous) => !previous)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {password && (
                        <div className="password-strength" aria-live="polite">
                            <div className="strength-heading">
                                <span>Password strength</span>
                                <strong className={`strength-${strengthLabel.toLowerCase()}`}>
                                    {strengthLabel}
                                </strong>
                            </div>

                            <div className="strength-track">
                                {passwordRequirements.map((requirement, index) => (
                                    <span
                                        key={requirement.label}
                                        className={
                                            index < passedRequirements
                                                ? 'strength-segment passed'
                                                : 'strength-segment'
                                        }
                                    />
                                ))}
                            </div>

                            <ul className="password-requirements">
                                {passwordRequirements.map((requirement) => (
                                    <li
                                        key={requirement.label}
                                        className={requirement.valid ? 'valid' : ''}
                                    >
                                        <span aria-hidden="true">
                                            {requirement.valid ? '✓' : '○'}
                                        </span>
                                        {requirement.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <label htmlFor="confirmPassword">Confirm password</label>
                    <div className="password-wrapper">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
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
                                setShowConfirmPassword((previous) => !previous)
                            }
                            aria-label={
                                showConfirmPassword
                                    ? 'Hide confirm password'
                                    : 'Show confirm password'
                            }
                        >
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {confirmPassword && (
                        <p
                            className={`password-match ${password === confirmPassword ? 'valid' : ''
                                }`}
                        >
                            {password === confirmPassword
                                ? '✓ Passwords match'
                                : '○ Passwords do not match'}
                        </p>
                    )}

                    {error && (
                        <p className="form-message error-message" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="sign-in-button"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating account...' : 'Create account'}
                        {!submitting && <span>↗</span>}
                    </button>
                </form>

                <div className="card-footer">
                    <span>Already have an account?</span>
                    <Link to="/login">Sign in</Link>
                </div>

                <p className="security-note">
                    Your space. Your privacy. Your control.
                </p>
            </div>
        </section>
    );
}

export default Register;
