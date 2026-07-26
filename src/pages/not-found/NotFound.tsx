import { Link } from 'wouter';
import { ROUTES } from 'src/router';
import { useAuthentication } from 'src/authentication/use-authentication';
import './not-found.css';
import { useThemeOverride } from 'src/themes/use-theme-override';
import { DARK_MODE, SPACE_STYLE, COMFORTABLE_DENSITY, GRAPHICS_TRUE } from 'src/themes/constants';

export function NotFound() {
    const { isAuthenticated, isLoading } = useAuthentication();
    const isPublicPage = !isLoading && !isAuthenticated;
    useThemeOverride(
        isPublicPage ? DARK_MODE : undefined,
        isPublicPage ? SPACE_STYLE : undefined,
        isPublicPage ? COMFORTABLE_DENSITY : undefined,
        isPublicPage ? GRAPHICS_TRUE : undefined,
    );

    return (
        <div className="not-found">
            <div className="not-found__card">
                <div className="not-found__icon">🌙✨</div>

                <h2 className="not-found__title">
                    You drifted a little off course
                </h2>

                {isAuthenticated ? (
                    <Link href={ROUTES.home}>
                        <button className="btn btn--primary">
                            Back to today
                        </button>
                    </Link>
                ) : (
                    <div className="not-found__actions">
                        <Link href={ROUTES.home}>
                            <button className="btn btn--primary">
                                Go to home
                            </button>
                        </Link>

                        <Link href={ROUTES.demo}>
                            <button className="btn btn--secondary">
                                Explore the demo
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}


export default NotFound;
