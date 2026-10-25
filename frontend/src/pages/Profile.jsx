
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import authService from '../services/authservice.js';

function Profile() {
    const { user, refreshUser } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setName(user?.name || '');
    }, [user?.name]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setMessage('');

        const trimmedName = name.trim();

        if (trimmedName.length < 2) {
            setError('Name must contain at least 2 characters.');
            return;
        }

        if (trimmedName.length > 80) {
            setError('Name cannot exceed 80 characters.');
            return;
        }

        try {
            setSaving(true);

            await authService.updateProfile({ name: trimmedName });

            if (refreshUser) {
                await refreshUser();
            }

            setName(trimmedName);
            setMessage('Profile updated successfully.');
        } catch (requestError) {
            setError(
                requestError.message ||
                'Unable to update your profile. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    }

    const displayName = user?.name || 'User';

    return (
        <section className="login-section">
            <div className="welcome-panel">
                <p className="eyebrow">YOUR ACCOUNT</p>

                <h1>
                    Your profile.
                    <br />
                    Your <span>identity.</span>
                </h1>

                <p className="welcome-description">
                    Keep your personal details up to date in your Nexora
                    workspace.
                </p>

                <div className="feature-note">
                    <span className="feature-dot" />
                    Your account, your control.
                </div>
            </div>

            <div className="login-card">
                <div className="card-heading">
                    <div className="card-mark">N</div>
                    <p className="eyebrow">MY PROFILE</p>
                    <h2>Personal details</h2>
                    <p>Update your name and save your changes.</p>
                </div>

                <div className="dashboard-user">
                    <div className="dashboard-avatar">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <strong>{displayName}</strong>
                        <span>Workspace member</span>
                    </div>
                </div>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <label htmlFor="profile-name">Full name</label>
                    <input
                        id="profile-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        minLength={2}
                        maxLength={80}
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            setError('');
                            setMessage('');
                        }}
                        required
                    />

                    <label htmlFor="profile-email">Email address</label>
                    <input
                        id="profile-email"
                        type="email"
                        value={user?.email || ''}
                        readOnly
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
                        disabled={saving}
                    >
                        {saving ? 'Saving changes...' : 'Save changes'}
                        {!saving && <span>↗</span>}
                    </button>
                </form>

                <div className="card-footer">
                    <Link to="/dashboard">← Back to dashboard</Link>
                </div>

                <p className="security-note">
                    Your space. Your privacy. Your control.
                </p>
            </div>
        </section>
    );
}

export default Profile;
