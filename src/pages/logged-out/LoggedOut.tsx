import { Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useLayoutEffect, useEffect, useRef, useSyncExternalStore } from "react";
import GoogleLoginButton from "src/authentication/google-login-button";
import { useThemeOverride } from "src/themes/use-theme-override";
import { DARK_MODE, SPACE_STYLE, COMFORTABLE_DENSITY, GRAPHICS_TRUE } from "src/themes/constants";
import { ROUTES } from "src/router";
import "./logged-out.css";
import { hasAuthSessionHint } from "src/authentication/authentication-api";

const subscribeToSessionHint = () => () => undefined;

export default function LoggedOut({
    onSuccessfulLogin,
    hasAuthenticatedSession = false,
}: {
    onSuccessfulLogin: (token: string) => Promise<void>;
    hasAuthenticatedSession?: boolean;
}) {
    const landingRootRef = useRef<HTMLDivElement>(null);

    const hasPersistedSession = useSyncExternalStore(
        subscribeToSessionHint,
        hasAuthSessionHint,
        () => false,
    );
    const canOpenApp = hasAuthenticatedSession || hasPersistedSession;

    useThemeOverride(
        DARK_MODE,
        SPACE_STYLE,
        COMFORTABLE_DENSITY,
        GRAPHICS_TRUE,
    );

    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-public-landing', 'true');


        return () => document.documentElement.removeAttribute('data-public-landing');
    }, []);

    useEffect(() => {
        const landingRoot = landingRootRef.current;
        if (!landingRoot) return;

        let animationFrame: number | null = null;
        let currentScrollPosition = landingRoot.scrollTop;
        let targetScrollPosition = currentScrollPosition;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const writeScrollPosition = () => {
            landingRoot.style.setProperty(
                '--landing-scroll-position',
                `${currentScrollPosition}px`,
            );
        };

        const animateScrollPosition = () => {
            const distance = targetScrollPosition - currentScrollPosition;

            if (
                reducedMotion.matches
                || Math.abs(distance) < 0.1
            ) {
                currentScrollPosition = targetScrollPosition;
                writeScrollPosition();
                animationFrame = null;
                return;
            }

            currentScrollPosition += distance * 0.22;
            writeScrollPosition();
            animationFrame = window.requestAnimationFrame(animateScrollPosition);
        };

        const handleScroll = () => {
            targetScrollPosition = landingRoot.scrollTop;
            if (animationFrame !== null) return;
            animationFrame = window.requestAnimationFrame(animateScrollPosition);
        };

        writeScrollPosition();
        landingRoot.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            landingRoot.removeEventListener('scroll', handleScroll);
            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }
        };
    }, []);


    return (
        <>
            <div className="logged-out-root parallax" ref={landingRootRef}>
                <img id="clouds" src="/pastel-paws-border.png" className="parallax-bg" />
                <div className="stars" aria-hidden="true" />
                <header className="landing-header">
                    <Link className="landing-brand" href={ROUTES.home} aria-label="Daily Reset List home">
                        <span className="landing-brand-mark">
                            <img src="./favicon-32x32.png" />
                        </span>
                        <span>Daily Reset List</span>
                    </Link>
                    <nav className="landing-nav" aria-label="Main navigation">
                        <Link href={ROUTES.templates}>Templates</Link>
                        <Link className="landing-nav-demo" href={canOpenApp ? ROUTES.app : ROUTES.demo}>
                            {canOpenApp ? "Open app" : "Try the demo"}
                        </Link>
                    </nav>
                </header>

                <main>
                    <section className="landing-hero" aria-labelledby="landing-title">
                        <div className="landing-hero-copy">
                            <img src="./mag6png.png" />
                            <p className="landing-eyebrow"><Sparkles size={15} aria-hidden="true" /> A daily list without the daily pressure</p>
                            <h1 id="landing-title">Daily Reset List</h1>
                            <p className="landing-lede">
                                Daily Reset List combines a list for recurring responsibilities,
                                one-time tasks, and google calendar events.
                            </p>
                            <div className="landing-actions">
                                <Link className="landing-primary-action" href={ROUTES.demo}>
                                    Try the demo
                                    <span aria-hidden="true">→</span>
                                </Link>
                                {canOpenApp ? (
                                    <Link className="landing-primary-action" href={ROUTES.app}>
                                        Open your list
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                ) : (
                                    <div className="landing-sign-in" id="landing-sign-in">
                                        <span>Or continue with Google</span>
                                        <div className="google-shell">
                                            <GoogleLoginButton onSuccess={onSuccessfulLogin} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="landing-reassurance">No goals to miss. No streaks to break. Just a softer place to begin.</p>
                        </div>

                        <div className="landing-product-preview" aria-label="Example Daily Reset List">
                            <div className="landing-preview-glow" aria-hidden="true" />
                            <div className="landing-preview-window">
                                <img className="landing-preview-checklist" src="./checklist.png" />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
