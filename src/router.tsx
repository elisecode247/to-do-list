import { Router } from 'wouter';

export const ROUTES = {
    home: '/',
    app: '/app',
    demo: '/demo',
    userSettings: '/app/settings',
    bulkEdit: '/app/bulk-edit',
    privacyPolicy: '/privacy-policy',
    themePlayground: '/theme-playground',
    templates: '/templates',
} as const;


export function AppRouter({ children }: { children: React.ReactNode }) {
  return (
    <Router>
      {children}
    </Router>
  );
}
