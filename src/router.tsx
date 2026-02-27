import { Router } from 'wouter';

export const BASE_PATH = '/to-do-list';

export const ROUTES = {
    home: '/',
    demo: '/demo',
    userSettings: '/settings',
    bulkEdit: '/bulk-edit',
} as const;


export function AppRouter({ children }: { children: React.ReactNode }) {
  return (
    <Router base={BASE_PATH}>
      {children}
    </Router>
  );
}
