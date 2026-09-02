import { useRef, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import IconButton from 'src/components/icon-button/IconButton';
import { useTheme } from './use-theme';
import './theme-mode-toggle.css';

const SYSTEM_DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

const subscribeToSystemMode = (onChange: () => void) => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => undefined;
    }

    const mediaQuery = window.matchMedia(SYSTEM_DARK_MODE_QUERY);
    mediaQuery.addEventListener('change', onChange);

    return () => mediaQuery.removeEventListener('change', onChange);
};

const systemPrefersDark = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(SYSTEM_DARK_MODE_QUERY).matches;

export default function ThemeModeToggle() {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { mode, updateTheme } = useTheme();
    const prefersDarkMode = useSyncExternalStore(subscribeToSystemMode, systemPrefersDark, () => false);
    const resolvedMode = mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;
    const nextMode = resolvedMode === 'light' ? 'dark' : 'light';

    function handleToggle() {
        const button = buttonRef.current;
        const prefersReducedMotion = typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!button || prefersReducedMotion || typeof document.startViewTransition !== 'function') {
            updateTheme({ mode: nextMode });
            return;
        }

        const buttonBounds = button.getBoundingClientRect();
        const originX = buttonBounds.left + buttonBounds.width / 2;
        const originY = buttonBounds.top + buttonBounds.height / 2;
        const revealRadius = Math.hypot(
            Math.max(originX, window.innerWidth - originX),
            Math.max(originY, window.innerHeight - originY),
        );

        const transition = document.startViewTransition(() => {
            flushSync(() => updateTheme({ mode: nextMode }));
        });

        void transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0 at ${originX}px ${originY}px)`,
                        `circle(${revealRadius}px at ${originX}px ${originY}px)`,
                    ],
                },
                {
                    duration: 300,
                    easing: 'linear',
                    pseudoElement: '::view-transition-new(root)',
                },
            );
        }).catch(() => {
            // The theme has already changed if the browser skips the transition.
        });
    }

    return (
        <IconButton
            ref={buttonRef}
            className="dark-light-toggle-button"
            label={`Switch to ${nextMode} theme`}
            ariaLabel={`Switch to ${nextMode} theme`}
            icon={resolvedMode === 'light' ? <Sun width={24} /> : <Moon width={24} />}
            showLabel={false}
            isPriority={false}
            onClick={handleToggle}
        />
    );
}
