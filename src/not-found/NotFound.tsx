import { Link } from 'wouter';
import { ROUTES } from 'src/router';
import { useAuthentication } from 'src/authentication/use-authentication';
import './not-found.css';

export function NotFound() {
    const { isAuthenticated } = useAuthentication();

    return (
        <div className="not-found">
            <div className="not-found__card">
                <div className="not-found__icon">🌙✨</div>

                <h2 className="not-found__title">
                    You drifted a little off course
                </h2>

                <p className="not-found__description">
                    This page doesn't exist — but you're not lost.
                    Let's gently bring you back.
                </p>

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
