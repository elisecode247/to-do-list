// purgecss.config.cjs
const purgecssConfig = {
    content: ['./src/**/*.html', './src/**/*.ts', './src/**/*.tsx'],
    css: ['./src/**/*.css'],
    safelist: [
        'headlessui-portal-root',
        'encryption-status--not_encrypted',
        'encryption-status--migrating',
        'encryption-status--encrypted',
        'encryption-status--error',
        'toast--error',
        'toast--success',
        'toast--info',
        'google-login-shell',
        'google-login-fallback'
    ],
    output: './dist/assets/css',
    rejected: true
};
module.exports = { purgecssConfig };
