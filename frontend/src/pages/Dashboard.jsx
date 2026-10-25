
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import dashboardService from '../services/dashboardService.js';

const defaultStats = [
    { label: 'Total Projects', value: '—', change: 'Your workspace', icon: '▦' },
    { label: 'Tasks Completed', value: '—', change: 'Completed tasks', icon: '✓' },
    { label: 'Productivity', value: '—', change: 'Workspace overview', icon: '↗' },
];

const defaultActivities = [
    {
        title: 'Welcome to Nexora',
        description: 'Your workspace is ready to get started.',
        time: 'Recently',
    },
];

function Dashboard() {
    const { user } = useAuth();
    const activityRef = useRef(null);

    const [stats, setStats] = useState(defaultStats);
    const [activities, setActivities] = useState(defaultActivities);
    const [loading, setLoading] = useState(true);
    const [notice, setNotice] = useState('');

    const displayName = user?.name || user?.email?.split('@')[0] || 'there';
    const emailVerified = user?.isEmailVerified === true;

    useEffect(() => {
        let active = true;

        async function loadDashboard() {
            try {
                const [overviewResult, activityResult] = await Promise.allSettled([
                    dashboardService.getOverview(),
                    dashboardService.getRecentActivity(),
                ]);

                if (!active) return;

                if (overviewResult.status === 'fulfilled') {
                    const overview =
                        overviewResult.value?.data ?? overviewResult.value;

                    if (overview) {
                        setStats([
                            {
                                label: 'Total Projects',
                                value: String(overview.totalProjects ?? '—'),
                                change: 'Your workspace',
                                icon: '▦',
                            },
                            {
                                label: 'Tasks Completed',
                                value: String(overview.tasksCompleted ?? '—'),
                                change: 'Completed tasks',
                                icon: '✓',
                            },
                            {
                                label: 'Productivity',
                                value: overview.productivity != null
                                    ? `${overview.productivity}%`
                                    : '—',
                                change: 'Workspace overview',
                                icon: '↗',
                            },
                        ]);
                    }
                }

                if (activityResult.status === 'fulfilled') {
                    const result =
                        activityResult.value?.data ?? activityResult.value;
                    const list = Array.isArray(result)
                        ? result
                        : result?.activities;

                    if (Array.isArray(list)) {
                        setActivities(
                            list.map((item, index) => ({
                                title: item.title || item.action || `Activity ${index + 1}`,
                                description: item.description || item.message || '',
                                time: item.time || item.createdAt || 'Recently',
                            })),
                        );
                    }
                }

                if (
                    overviewResult.status === 'rejected' &&
                    activityResult.status === 'rejected'
                ) {
                    setNotice('Dashboard data is unavailable. Please try again later.');
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    function scrollToActivity() {
        activityRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }

    return (
        <div className="dashboard-content">
            <header className="dashboard-topbar">
                <div>
                    <p className="dashboard-eyebrow">YOUR WORKSPACE</p>
                    <h1>Dashboard</h1>
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
            </header>

            <section className="dashboard-welcome">
                <div>
                    <p className="dashboard-eyebrow">WELCOME BACK</p>
                    <h2>Good to have you here, {displayName}.</h2>
                    <p>Your space is ready. Take a moment to plan your next move.</p>
                </div>
                <div className="welcome-symbol">N<span>.</span></div>
            </section>

            {notice && (
                <p className="form-message error-message" role="status">
                    {notice}
                </p>
            )}

            <section className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <p className="dashboard-eyebrow">AT A GLANCE</p>
                        <h2>Your overview</h2>
                    </div>
                    {loading && <span className="sample-label">LOADING...</span>}
                </div>

                <div className="stats-grid">
                    {stats.map((stat) => (
                        <article className="stat-card" key={stat.label}>
                            <div className="stat-card-top">
                                <span>{stat.label}</span>
                                <span className="stat-icon">{stat.icon}</span>
                            </div>
                            <strong className="stat-value">{stat.value}</strong>
                            <span className="stat-change">{stat.change}</span>
                        </article>
                    ))}
                </div>
            </section>

            <section className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <p className="dashboard-eyebrow">GET STARTED</p>
                        <h2>Quick actions</h2>
                    </div>
                </div>

                <div className="stats-grid">
                    <Link to="/profile" className="stat-card quick-action-card">
                        <div className="stat-card-top">
                            <span>Edit profile</span>
                            <span className="stat-icon">♙</span>
                        </div>
                        <strong className="quick-action-title">Your details</strong>
                        <span className="stat-change">
                            Update your personal information ↗
                        </span>
                    </Link>

                    <button
                        type="button"
                        className="stat-card quick-action-card"
                        onClick={scrollToActivity}
                    >
                        <div className="stat-card-top">
                            <span>Recent activity</span>
                            <span className="stat-icon">✦</span>
                        </div>
                        <strong className="quick-action-title">Your updates</strong>
                        <span className="stat-change">
                            Review your latest account activity ↓
                        </span>
                    </button>
                </div>
            </section>

            <section className="dashboard-section account-status-section">
                <div className="section-heading">
                    <div>
                        <p className="dashboard-eyebrow">ACCOUNT</p>
                        <h2>Account status</h2>
                    </div>
                </div>

                <div className="activity-list">
                    <article className="activity-item">
                        <div className="activity-icon">
                            {emailVerified ? '✓' : '!'}
                        </div>
                        <div className="activity-details">
                            <strong>Email verification</strong>
                            <p>
                                {emailVerified
                                    ? 'Your email address has been verified.'
                                    : 'Email verification status is pending or unavailable.'}
                            </p>
                        </div>
                        <span className="activity-time">
                            {emailVerified ? 'Verified' : 'Check status'}
                        </span>
                    </article>

                    <article className="activity-item">
                        <div className="activity-icon">♙</div>
                        <div className="activity-details">
                            <strong>Profile details</strong>
                            <p>
                                {user?.name && user?.email
                                    ? 'Your name and email are available.'
                                    : 'Complete your profile details.'}
                            </p>
                        </div>
                        <Link to="/profile" className="activity-time">
                            View profile ↗
                        </Link>
                    </article>
                </div>
            </section>

            <section
                className="dashboard-section activity-section"
                ref={activityRef}
            >
                <div className="section-heading">
                    <div>
                        <p className="dashboard-eyebrow">YOUR LATEST UPDATES</p>
                        <h2>Recent activity</h2>
                    </div>
                </div>

                <div className="activity-list">
                    {activities.map((activity, index) => (
                        <article
                            className="activity-item"
                            key={`${activity.title}-${index}`}
                        >
                            <div className="activity-icon">✦</div>
                            <div className="activity-details">
                                <strong>{activity.title}</strong>
                                <p>{activity.description}</p>
                            </div>
                            <span className="activity-time">{activity.time}</span>
                        </article>
                    ))}
                </div>
            </section>

            <footer className="dashboard-footer">
                <span>© 2026 NEXORA</span>
                <span>DESIGNED FOR WHAT'S NEXT</span>
            </footer>
        </div>
    );
}

export default Dashboard;
