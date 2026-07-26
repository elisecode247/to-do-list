import {
    CalendarDays,
    Check,
    History,
    Layers3,
    NotebookPen,
    RefreshCcw,
    Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { useLayoutEffect } from "react";
import GoogleLoginButton from "src/authentication/google-login-button";
import { useThemeOverride } from "src/themes/use-theme-override";
import { DARK_MODE, SPACE_STYLE, COMFORTABLE_DENSITY, GRAPHICS_TRUE } from "src/themes/constants";
import { ROUTES } from "src/router";
import "./logged-out.css";

const features = [
    {
        icon: <RefreshCcw aria-hidden="true" />,
        title: "A fresh list every day",
        text: "Daily tasks return when you need them. There are no streaks to protect and no overdue pile waiting for you.",
    },
    {
        icon: <History aria-hidden="true" />,
        title: "A little helpful history",
        text: "See when you last finished something, so you can decide what matters today without tracking every habit.",
    },
    {
        icon: <NotebookPen aria-hidden="true" />,
        title: "A place to catch your thoughts",
        text: "Use notes and the interstitial journal to put distracting thoughts somewhere safe, then return to what you chose.",
    },
    {
        icon: <CalendarDays aria-hidden="true" />,
        title: "Your day, in one place",
        text: "Bring in Google Calendar events when you want them, alongside daily, occasional, and one-time tasks.",
    },
];

const steps = [
    {
        number: "01",
        title: "Remember gently",
        text: "Add the recurring and one-time things you want your future self to remember.",
    },
    {
        number: "02",
        title: "Choose today",
        text: "See a calm, focused view of what is relevant now—not everything you could possibly do.",
    },
    {
        number: "03",
        title: "Reset without judgment",
        text: "Complete, skip, hide, or postpone. Tomorrow begins fresh, without a score attached.",
    },
];

const previewTasks = [
    { text: "Drink a glass of water", detail: "Daily", done: true },
    { text: "Start the workday", detail: "8 gentle steps", done: false },
    { text: "Text someone back", detail: "One time", done: false },
    { text: "Reset the kitchen", detail: "Last completed 4 days ago", done: false },
];

export default function LoggedOut({
    onSuccessfulLogin,
    isCheckingSession = false,
}: {
    onSuccessfulLogin: (token: string) => Promise<void>;
    isCheckingSession?: boolean;
}) {
    // Preserve a returning user's saved theme while their session is resolving.
    // Once they are confirmed signed out, public pages use the Space presentation.
    useThemeOverride(
        isCheckingSession ? undefined : DARK_MODE,
        isCheckingSession ? undefined : SPACE_STYLE,
        isCheckingSession ? undefined : COMFORTABLE_DENSITY,
        isCheckingSession ? undefined : GRAPHICS_TRUE,
        isCheckingSession,
    );

    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-public-landing', 'true');
        return () => document.documentElement.removeAttribute('data-public-landing');
    }, []);

    return (
        <>
        <div className="logged-out-root">
            <div className="stars" aria-hidden="true" />

            <header className="landing-header">
                <Link className="landing-brand" href={ROUTES.home} aria-label="Daily Reset List home">
                    <span className="landing-brand-mark"><Check size={16} strokeWidth={3} aria-hidden="true" /></span>
                    <span>Daily Reset List</span>
                </Link>
                <nav className="landing-nav" aria-label="Main navigation">
                    <a href="#how-it-works">How it works</a>
                    <Link href={ROUTES.templates}>Templates</Link>
                    <Link className="landing-nav-demo" href={ROUTES.demo}>Try the demo</Link>
                </nav>
            </header>

            <main>
                <section className="landing-hero" aria-labelledby="landing-title">
                    <div className="landing-hero-copy">
                        <p className="landing-eyebrow"><Sparkles size={15} aria-hidden="true" /> A daily list without the daily pressure</p>
                        <h1 id="landing-title">A gentler way to remember what matters today.</h1>
                        <p className="landing-lede">
                            Daily Reset List is a calm task list for recurring responsibilities,
                            one-time reminders, and the life happening in between—without streaks,
                            scores, or overdue guilt.
                        </p>
                        <div className="landing-actions">
                            <Link className="landing-primary-action" href={ROUTES.demo}>
                                Try the demo
                                <span aria-hidden="true">→</span>
                            </Link>
                            <div className="landing-sign-in" id="landing-sign-in">
                                <span>Or continue with Google</span>
                                <div className="google-shell">
                                    <GoogleLoginButton onSuccess={onSuccessfulLogin} />
                                </div>
                            </div>
                        </div>
                        <p className="landing-reassurance">No goals to miss. No streaks to break. Just a softer place to begin.</p>
                    </div>

                    <div className="landing-product-preview" aria-label="Example Daily Reset List">
                        <div className="landing-preview-glow" aria-hidden="true" />
                        <div className="landing-preview-window">
                            <div className="landing-preview-topbar">
                                <div>
                                    <span className="landing-preview-kicker">Your gentle reset</span>
                                    <h2>Today</h2>
                                </div>
                            </div>
                            <div className="landing-preview-tabs" aria-hidden="true">
                                <span>Journal</span>
                                <span>Priority</span>
                                <span className="is-active">Today</span>
                                <span>Upcoming</span>
                            </div>
                            <ul className="landing-preview-list">
                                {previewTasks.map(task => (
                                    <li className={task.done ? "is-done" : ""} key={task.text}>
                                        <span className="landing-preview-check" aria-hidden="true">
                                            {task.done && <Check size={14} strokeWidth={3} />}
                                        </span>
                                        <span>
                                            <strong>{task.text}</strong>
                                            <small>{task.detail}</small>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="landing-promise" aria-label="The Daily Reset List approach">
                    <p>No streaks to maintain.</p>
                    <span aria-hidden="true">✦</span>
                    <p>No productivity score.</p>
                    <span aria-hidden="true">✦</span>
                    <p>No judgment tomorrow.</p>
                </section>

                <section className="landing-section landing-how" id="how-it-works" aria-labelledby="how-title">
                    <div className="landing-section-heading">
                        <p className="landing-eyebrow"><Layers3 size={15} aria-hidden="true" /> How it works</p>
                        <h2 id="how-title">No more wondering if you forgot something.</h2>
                        <p>Daily Reset List keeps enough context to help, then gets out of your way.</p>
                    </div>
                    <ol className="landing-steps">
                        {steps.map(step => (
                            <li key={step.number}>
                                <span className="landing-step-number">{step.number}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="landing-section landing-features" aria-labelledby="features-title">
                    <div className="landing-section-heading landing-section-heading--center">
                        <p className="landing-eyebrow">Made for real, uneven days</p>
                        <h2 id="features-title">Helpful structure, without the emotional penalty.</h2>
                    </div>
                    <div className="landing-feature-grid">
                        {features.map(feature => (
                            <article className="landing-feature-card" key={feature.title}>
                                <span className="landing-feature-icon">{feature.icon}</span>
                                <h3>{feature.title}</h3>
                                <p>{feature.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="landing-section landing-templates" aria-labelledby="templates-title">
                    <div className="landing-template-copy">
                        <p className="landing-eyebrow">Start with something ready</p>
                        <h2 id="templates-title">Gentle templates for the work of being a person.</h2>
                        <p>
                            Begin with practical routines for home, self-care, pets, relationships,
                            and work. Keep what helps and change everything else.
                        </p>
                        <Link className="landing-text-link" href={ROUTES.templates}>
                            Browse all task templates <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                    <div className="landing-template-stack">
                        <Link href={ROUTES.templates} className="landing-template-card">
                            <span>Self-care</span>
                            <strong>Morning reset</strong>
                            <small>15 flexible steps</small>
                        </Link>
                        <Link href={ROUTES.templates} className="landing-template-card">
                            <span>Work</span>
                            <strong>Focus session</strong>
                            <small>A bounded place to begin</small>
                        </Link>
                        <Link href={ROUTES.templates} className="landing-template-card">
                            <span>Home</span>
                            <strong>Daily cleaning</strong>
                            <small>Small resets that can recur</small>
                        </Link>
                    </div>
                </section>

                <section className="landing-final-cta" aria-labelledby="final-cta-title">
                    <p className="landing-eyebrow">Nothing is urgent right now</p>
                    <h2 id="final-cta-title">You do not need a better streak.<br />You need a kinder place to begin.</h2>
                    <div className="landing-final-actions">
                        <Link className="landing-primary-action" href={ROUTES.demo}>Explore the demo <span aria-hidden="true">→</span></Link>
                        <GoogleLoginButton onSuccess={onSuccessfulLogin} />
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <Link className="landing-brand" href={ROUTES.home}>
                    <span className="landing-brand-mark"><Check size={16} strokeWidth={3} aria-hidden="true" /></span>
                    <span>Daily Reset List</span>
                </Link>
                <p>Gentle remembering without emotional penalty.</p>
                <nav aria-label="Footer navigation">
                    <Link href={ROUTES.demo}>Demo</Link>
                    <Link href={ROUTES.templates}>Templates</Link>
                    <Link href={ROUTES.privacyPolicy}>Privacy</Link>
                    <a href="https://buymeacoffee.com/elisestraub" target="_blank" rel="noopener noreferrer">Support</a>
                </nav>
            </footer>
        </div>
        {isCheckingSession && (
            <div className="returning-user-loading" role="status" aria-label="Restoring your session">
                <div aria-hidden="true" className="returning-user-loading__spinner" />
                <span className="visually-hidden">Restoring your session</span>
            </div>
        )}
        </>
    );
}
