const isLocal = import.meta.env.VITE_LOCAL === 'true';

export const API_AUTH_URL = !isLocal ? "https://demo-server-production-9fc2.up.railway.app/auth" : import.meta.env.VITE_API_AUTH_URL;
export const API_URL = !isLocal ? "https://demo-server-production-9fc2.up.railway.app/chores" : import.meta.env.VITE_API_URL;
export const API_TENOR_URL = !isLocal ? "https://demo-server-production-9fc2.up.railway.app/tenor" : import.meta.env.VITE_API_TENOR_URL;
export const API_REFRESH_URL = !isLocal ? "https://demo-server-production-9fc2.up.railway.app/auth/refresh" : import.meta.env.VITE_API_REFRESH_URL;
export const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY ;
