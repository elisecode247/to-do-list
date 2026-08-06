import * as Sentry from '@sentry/react';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
        Sentry.feedbackIntegration({
            submitButtonLabel: 'Send Feedback',
            formTitle: 'Send Feedback',
            autoInject: false,
        }),
    ],
});
