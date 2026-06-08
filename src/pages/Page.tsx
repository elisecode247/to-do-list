import AccountMenu from "src/app/AccountMenu";
import { Link, useLocation } from "wouter";
import { Home } from "lucide-react";
import { ROUTES } from "src/router";
import './page.css';
import { useTheme } from "src/themes/use-theme";
import { useState } from "react";

interface PageProps {
    title: string;
    children: React.ReactNode;
}
function Page({ title, children }: PageProps) {
    useTheme();
    const [location] = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }
    return (
        <div className="page_container">
            <header className="app_header">
                {location !== ROUTES.home && (
                    <Link href={ROUTES.home} className="page-btn page-btn--primary">
                        <Home size={24} />
                    </Link>
                )}
                <h1 className="app_h1 page_h1">Daily Reset</h1>
                <div></div>
                <AccountMenu isMenuOpen={isMenuOpen} onMenuToggleOpen={toggleMenu} onMenuClose={() => setIsMenuOpen(false)} />

            </header>
            <div className="page-content">
                <h2 className="page_h2">{title}</h2>
                {children}
            </div>
        </div>
    );
}

export default Page;
