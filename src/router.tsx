import { Router } from 'wouter';

export const ROUTES = {
    home: '/',
    demo: '/demo',
    userSettings: '/settings',
    bulkEdit: '/bulk-edit',
} as const;


export function AppRouter({ children }: { children: React.ReactNode }) {
  return (
    <Router>
      {children}
    </Router>
  );
}
