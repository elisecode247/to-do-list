import type { CategoryIconKey } from './types';

export const CATEGORY_ICON_KEYS = [
    'briefcase',
    'house',
    'heart',
    'users',
    'paw',
    'sparkles',
    'book',
    'coffee',
    'dumbbell',
    'flower',
    'music',
    'plane',
    'calendar',
    'cart',
    'receipt',
    'wallet',
    'laptop',
    'wrench',
    'smartphone',
    'pill',
    'graduation',
    'car',
    'clipboard',
    'bell',
] as const;


const ICON_ALIASES: Record<string, CategoryIconKey> = {
    Briefcase: 'briefcase',
    Home: 'house',
    House: 'house',
    Heart: 'heart',
    Users: 'users',
    PawPrint: 'paw',
    Sparkles: 'sparkles',
    BookOpen: 'book',
    Coffee: 'coffee',
    Dumbbell: 'dumbbell',
    Flower2: 'flower',
    Music: 'music',
    Plane: 'plane',
    Calendar: 'calendar',
    CalendarDays: 'calendar',
    ShoppingCart: 'cart',
    Receipt: 'receipt',
    Wallet: 'wallet',
    Laptop: 'laptop',
    Wrench: 'wrench',
    Smartphone: 'smartphone',
    Phone: 'smartphone',
    Pill: 'pill',
    GraduationCap: 'graduation',
    Car: 'car',
    ClipboardList: 'clipboard',
    Bell: 'bell',
};

export function normalizeCategoryIcon(value?: string): CategoryIconKey | undefined {
    if (!value) return undefined;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (CATEGORY_ICON_KEYS.includes(trimmed as CategoryIconKey)) {
        return trimmed as CategoryIconKey;
    }

    return ICON_ALIASES[trimmed];
}
