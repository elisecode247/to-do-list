import {
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { API_URL } from "src/app/constants";
import type {  ServerCategoryDefinition, CategoryDefinition } from "src/category-select/types";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";
import { useToast } from "src/toast/use-toast";
import { UserSettingsContext, type UserSettingsContextValue } from "./user-settings-context";

const USER_SETTINGS_URL = API_URL + "/user-settings";
const USER_CATEGORIES_URL = API_URL + "/user-categories";

function normalizeFetchedCategories(payload: ServerCategoryDefinition[]): CategoryDefinition[] {
    return payload.map(category => ({
        id: category.uuid ?? '',
        name: category.name ?? '',
        color: category.color ?? '#ffffff',
        icon: category.icon ?? '',
        isVisible: category.isVisible ?? true,
        isBuiltIn: category.isBuiltIn,
        builtInKey: category.builtInKey ?? undefined,
        isDeleted: false,
    }));
}

function normalizeCategoryUpdate(value?: string): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
}

export function UserSettingsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthentication();
    const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
    const [categories, setCategories] = useState<CategoryDefinition[]>([]);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const { showToast } = useToast();

    const fetchUserCategories = useCallback(async (cancelled = false): Promise<void> => {
        try {
            const response = await fetch(USER_CATEGORIES_URL, {
                method: "GET",
                headers: await authHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to load categories: ${response.status}`);
            }

            const fetched = await response.json();
            if (!cancelled) {
                setCategories(normalizeFetchedCategories(fetched));
            }
        } catch (err) {
            console.error("Loading user categories failed:", err);
            if (!cancelled) {
                showToast('Failed to load categories. Please refresh the page.', 'error');
            }
        }
    }, [showToast]);

    useEffect(() => {
        if (!isAuthenticated) {
            setCategories([]);
            setIsLoadingSettings(false);
            return;
        }

        setIsLoadingSettings(true);
        let isCancelled = false;

        async function loadUserSettings() {
            try {
                const [settingsResponse, categoriesResponse] = await Promise.all([
                    fetch(USER_SETTINGS_URL, {
                        method: "GET",
                        headers: await authHeaders(),
                    }),
                    fetch(USER_CATEGORIES_URL, {
                        method: "GET",
                        headers: await authHeaders(),
                    }),
                ]);

                if (!settingsResponse.ok) {
                    throw new Error(`Failed to load user settings: ${settingsResponse.status}`);
                }

                if (!categoriesResponse.ok) {
                    throw new Error(`Failed to load categories: ${categoriesResponse.status}`);
                }

                const [settings, rawCategories] = await Promise.all([
                    settingsResponse.json(),
                    categoriesResponse.json(),
                ]);

                const nextEnableCalendar = settings?.googleCalendarEnabled ?? settings?.userSettings?.googleCalendarEnabled;

                if (!isCancelled && typeof nextEnableCalendar === "boolean") {
                    setGoogleCalendarEnabled(nextEnableCalendar);
                }

                if (!isCancelled) {
                    setCategories(normalizeFetchedCategories(rawCategories));
                    setIsLoadingSettings(false);
                }
            } catch (err) {
                console.error("Loading user settings failed:", err);
                showToast('Failed to load user settings. Please refresh the page.', 'error');
                if (!isCancelled) {
                    setIsLoadingSettings(false);
                }
            }
        }

        void loadUserSettings();

        return () => {
            isCancelled = true;
        };
    }, [isAuthenticated, showToast]);

    const updateEnableCalendar = useCallback(async (nextValue: boolean) => {
        try {
            const response = await fetch(USER_SETTINGS_URL, {
                method: "PUT",
                headers: await authHeaders(),
                body: JSON.stringify({ googleCalendarEnabled: nextValue }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update user settings: ${response.status}`);
            }
            const updatedSettings = await response.json();
            setGoogleCalendarEnabled(updatedSettings?.googleCalendarEnabled ?? updatedSettings?.userSettings?.googleCalendarEnabled);
        } catch (err) {
            console.error("Updating user settings failed:", err);
            showToast('Failed to update Google Calendar setting. Please try again.', 'error');
        }
    }, [showToast]);

    const createCategory = useCallback<UserSettingsContextValue['createCategory']>((input) => {
        const optimisticId = `custom-${crypto.randomUUID()}`;
        const optimisticCategory: CategoryDefinition = {
            id: optimisticId,
            name: input.name.trim(),
            color: input.color,
            icon: normalizeCategoryUpdate(input.icon),
            isVisible: true,
            isBuiltIn: false,
            isDeleted: false,
        };

        setCategories(prev => ([
            ...prev,
            optimisticCategory,
        ]));

        void (async () => {
            try {
                const response = await fetch(USER_CATEGORIES_URL, {
                    method: "POST",
                    headers: await authHeaders(),
                    body: JSON.stringify({
                        name: optimisticCategory.name,
                        color: optimisticCategory.color,
                        icon: optimisticCategory.icon,
                        isVisible: true,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to create category: ${response.status}`);
                }

                await fetchUserCategories();
            } catch (err) {
                console.error("Creating category failed:", err);
                setCategories(prev => prev.filter(category => category.id !== optimisticId));
                showToast('Failed to create category. Please try again.', 'error');
            }
        })();

        return optimisticId;
    }, [fetchUserCategories, showToast]);

    const updateCategory = useCallback<UserSettingsContextValue['updateCategory']>((id, updates) => {
        const name = normalizeCategoryUpdate(updates.name);
        const color = normalizeCategoryUpdate(updates.color);
        const icon = normalizeCategoryUpdate(updates.icon);

        setCategories(prev => prev.map(category => {
            if (category.id !== id) return category;

            return {
                ...category,
                name: name ?? category.name,
                color: color ?? category.color,
                icon,
            };
        }));

        void (async () => {
            try {
                const response = await fetch(`${USER_CATEGORIES_URL}/${encodeURIComponent(id)}`, {
                    method: "PATCH",
                    headers: await authHeaders(),
                    body: JSON.stringify({
                        ...(name !== undefined ? { name } : {}),
                        ...(color !== undefined ? { color } : {}),
                        icon,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update category: ${response.status}`);
                }
            } catch (err) {
                console.error("Updating category failed:", err);
                showToast('Failed to update category. Reloading categories...', 'error');
                await fetchUserCategories();
            }
        })();
    }, [fetchUserCategories, showToast]);

    const setCategoryVisibility = useCallback<UserSettingsContextValue['setCategoryVisibility']>((id, isVisible) => {
        setCategories(prev => prev.map(category => {
            if (category.id !== id) return category;

            return {
                ...category,
                isVisible,
                isDeleted: category.isBuiltIn ? false : category.isDeleted,
            };
        }));

        void (async () => {
            try {
                const response = await fetch(`${USER_CATEGORIES_URL}/${encodeURIComponent(id)}`, {
                    method: "PATCH",
                    headers: await authHeaders(),
                    body: JSON.stringify({ isVisible }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update category visibility: ${response.status}`);
                }
            } catch (err) {
                console.error("Updating category visibility failed:", err);
                showToast('Failed to update category visibility. Reloading categories...', 'error');
                await fetchUserCategories();
            }
        })();
    }, [fetchUserCategories, showToast]);

    const deleteCategory = useCallback<UserSettingsContextValue['deleteCategory']>((id) => {
        void (async () => {
            try {
                const response = await fetch(`${USER_CATEGORIES_URL}/${encodeURIComponent(id)}`, {
                    method: "DELETE",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete category: ${response.status}`);
                }

                setCategories(prev => prev.map(category => {
                    if (category.id !== id || category.isBuiltIn) return category;

                    return {
                        ...category,
                        isVisible: false,
                        isDeleted: true,
                    };
                }));
            } catch (err) {
                console.error("Deleting category failed:", err);
                showToast('Failed to delete category. Reloading categories...', 'error');
                await fetchUserCategories();
            }
        })();
    }, [fetchUserCategories, showToast]);

    const value = useMemo<UserSettingsContextValue>(() => ({
        googleCalendarEnabled,
        categories,
        isLoadingSettings,
        updateEnableCalendar,
        createCategory,
        updateCategory,
        setCategoryVisibility,
        deleteCategory,
    }), [
        googleCalendarEnabled,
        categories,
        isLoadingSettings,
        updateEnableCalendar,
        createCategory,
        updateCategory,
        setCategoryVisibility,
        deleteCategory,
    ]);

    return createElement(UserSettingsContext.Provider, { value }, children);
}
