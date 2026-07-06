import { Router } from 'wouter';

export const ROUTES = {
    home: '/',
    demo: '/demo',
    userSettings: '/settings',
    bulkEdit: '/bulk-edit',
    privacyPolicy: '/privacy-policy',
    themePlayground: '/theme-playground',
} as const;


export function AppRouter({ children }: { children: React.ReactNode }) {
  return (
    <Router>
      {children}
    </Router>
  );
}
