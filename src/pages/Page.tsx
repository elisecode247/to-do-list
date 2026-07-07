import AccountMenu from "src/app/AccountMenu";
import { Link, useLocation } from "wouter";
import { Home } from "lucide-react";
import { ROUTES } from "src/router";
import './page.css';
import { useTheme } from "src/themes/use-theme";
import { useState } from "react";
import Footer from "src/footer/Footer";

interface PageProps {
    title?: string;
    children: React.ReactNode;
    privacyLink?: boolean;
}
function Page({ title, children, privacyLink = true }: PageProps) {
    useTheme();
    const [location] = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }
    return (
        <div className="page_container">
            <header className="page_header">
                {location !== ROUTES.home && (
                    <Link href={ROUTES.home} className="page-btn page-btn--primary page-home-btn">
                        <Home size={24} />
                    </Link>
                )}
                <h1 className="page_h1">Daily Reset List</h1>
                <AccountMenu isMenuOpen={isMenuOpen} onMenuToggleOpen={toggleMenu} onMenuClose={() => setIsMenuOpen(false)} />
            </header>
            <div className="page-content">
                {title && <h2 className="visually-hidden">{title}</h2>}
                {children}
            </div>
            {privacyLink && <Footer />}
        </div>
    );
}

export default Page;
