import { Router } from 'wouter';

export const BASE_PATH = '/to-do-list';

export const withBase = (path: string) =>
    `${BASE_PATH}${path}`;

export const ROUTES = {
    home: '/',
    demo: '/demo',
    userSettings: '/settings',
} as const;


export function AppRouter({ children }: { children: React.ReactNode }) {
  return (
    <Router base={BASE_PATH}>
      {children}
    </Router>
  );
}
