
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);

    const displayName =
        user?.name?.trim() ||
        user?.email?.split('@')[0] ||
        'Member';

    const avatarInitial = displayName.charAt(0).toUpperCase() || 'M';

    async function handleLogout() {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            navigate('/login', { replace: true });
            setLoggingOut(false);
        }
    }

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <NavLink
                    className="sidebar-brand"
                    to="/dashboard"
                    aria-label="Nexora dashboard"
                >
                    NEXORA<span>.</span>
                </NavLink>

                <div className="sidebar-label">WORKSPACE</div>

                <nav
                    className="sidebar-nav"
                    aria-label="Main navigation"
                >
                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="sidebar-icon" aria-hidden="true">
                            ▦
                        </span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="sidebar-icon" aria-hidden="true">
                            ♙
                        </span>
                        My Profile
                    </NavLink>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-profile">
                        <div
                            className="dashboard-avatar"
                            aria-hidden="true"
                        >
                            {avatarInitial}
                        </div>

                        <div className="sidebar-profile-details">
                            <strong>{displayName}</strong>
                            <span>Workspace member</span>
                        </div>
                    </div>

                    <button
                        className="logout-link"
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        <span className="sidebar-icon" aria-hidden="true">
                            ↪
                        </span>
                        {loggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;
