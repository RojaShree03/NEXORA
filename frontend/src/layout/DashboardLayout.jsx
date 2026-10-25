
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const displayName = user?.name || user?.email?.split('@')[0] || 'Member';

    async function handleLogout() {
        try {
            await logout();
        } finally {
            navigate('/login', { replace: true });
        }
    }

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <NavLink className="sidebar-brand" to="/dashboard">
                    NEXORA<span>.</span>
                </NavLink>

                <div className="sidebar-label">WORKSPACE</div>

                <nav className="sidebar-nav" aria-label="Main navigation">
                    <NavLink
                        to="/dashboard"
                        end
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="sidebar-icon">▦</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="sidebar-icon">♙</span>
                        My Profile
                    </NavLink>
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-profile">
                        <div className="dashboard-avatar">
                            {displayName.charAt(0).toUpperCase()}
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
                    >
                        <span className="sidebar-icon">↪</span>
                        Sign out
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
