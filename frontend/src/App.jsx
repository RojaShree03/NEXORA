
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';

import AuthLayout from './layout/AuthLayout.jsx';
import DashboardLayout from './layout/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoutes.jsx';

import './styles/dashboard.css';
import './styles/verify-email.css';

function NotFound() {
    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                padding: '24px',
                background: '#11110f',
                color: '#f5f0e8',
                textAlign: 'center',
            }}
        >
            <div>
                <h1>404 — Page Not Found</h1>

                <p style={{ marginTop: '12px', color: '#a49f95' }}>
                    The page you are looking for does not exist.
                </p>

                <a
                    href="/login"
                    style={{
                        display: 'inline-block',
                        marginTop: '20px',
                        color: '#e1c99e',
                    }}
                >
                    Back to login
                </a>
            </div>
        </main>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
