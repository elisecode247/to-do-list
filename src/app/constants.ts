const isLocal = import.meta.env.VITE_LOCAL === 'true';

export const API_URL = !isLocal ? "https://api.dailyresetlist.com" : import.meta.env.VITE_API_URL;
export const API_AUTH_URL = !isLocal ? "https://api.dailyresetlist.com/auth" : import.meta.env.VITE_API_AUTH_URL;
export const API_CHORES_URL = !isLocal ? "https://api.dailyresetlist.com/chores" : import.meta.env.VITE_API_CHORES_URL;
export const API_JOURNAL_URL = !isLocal ? "https://api.dailyresetlist.com/journal" : import.meta.env.VITE_API_JOURNAL_URL;
export const API_REFRESH_URL = !isLocal ? "https://api.dailyresetlist.com/auth/refresh" : import.meta.env.VITE_API_REFRESH_URL;
