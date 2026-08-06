import AccountMenu from "src/app/AccountMenu";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { ROUTES } from "src/router";
import './page.css';
import { useThemeOverride } from "src/themes/use-theme-override";
import { useAuthentication } from "src/authentication/use-authentication";
import { COMFORTABLE_DENSITY, DARK_MODE, GRAPHICS_TRUE, SPACE_STYLE } from "src/themes/constants";
import { useState } from "react";
import Footer from "src/footer/Footer";

interface PageProps {
    title?: string;
    children: React.ReactNode;
    privacyLink?: boolean;
}
function Page({ title, children, privacyLink = true }: PageProps) {
    const { isAuthenticated, isLoading } = useAuthentication();
    const isPublicPage = !isLoading && !isAuthenticated;
    useThemeOverride(
        isPublicPage ? DARK_MODE : undefined,
        isPublicPage ? SPACE_STYLE : undefined,
        isPublicPage ? COMFORTABLE_DENSITY : undefined,
        isPublicPage ? GRAPHICS_TRUE : undefined,
    );
    const [location] = useLocation();
    const search = useSearch();
    const isDemoFlow = new URLSearchParams(search).get('demo') === '1';
    const homeRoute = isAuthenticated ? ROUTES.app : ROUTES.home;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function toggleMenu() {
        setIsMenuOpen(prev => !prev);
    }
    return (
        <div className="page_container">
            <header className="page_header">
                {isDemoFlow ? (
                    <Link href={ROUTES.demo} className="page-btn page-btn--primary page-demo-back-link">
                        <ArrowLeft size={18} aria-hidden="true" />
                        Back to demo
                    </Link>
                ) : location !== homeRoute && (
                    <Link href={homeRoute} className="page-btn page-btn--primary page-home-btn">
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
