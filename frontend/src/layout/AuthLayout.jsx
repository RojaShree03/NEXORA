
import { Link, Outlet } from 'react-router-dom';

function AuthLayout() {
    const currentYear = new Date().getFullYear();

    return (
        <main className="app-container">
            <header className="site-header">
                <Link className="brand" to="/login" aria-label="Nexora home">
                    NEXORA<span>.</span>
                </Link>

                <p className="header-caption">
                    YOUR SPACE. YOUR NEXT CHAPTER.
                </p>
            </header>

            <Outlet />

            <footer className="site-footer">
                <span>© {currentYear} NEXORA</span>
                <span>DESIGNED FOR WHAT'S NEXT</span>
            </footer>
        </main>
    );
}

export default AuthLayout;
