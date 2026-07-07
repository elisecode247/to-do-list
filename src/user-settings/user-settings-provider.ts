import {
    createElement,
    useCallback,
    useEffect,
    useState,
    useMemo,
    type ReactNode,
} from "react";
import { API_URL } from "src/app/constants";
import {
    mergeStoredCategories,
    type CategoryDefinition,
} from "src/category-select/category-constants";
import { authHeaders } from "src/authentication/authentication-api";
import { useAuthentication } from "src/authentication/use-authentication";
import { useToast } from "src/toast/use-toast";
import {
    readPersistentSetting,
    requestPersistentStorage,
    writePersistentSetting,
} from "src/utilities/persistent-storage";
import { UserSettingsContext, type UserSettingsContextValue } from "./user-settings-context";

const USER_SETTINGS_URL = API_URL + "/user-settings";
const CATEGORY_SETTINGS_KEY = "custom-task-categories";

function loadStoredCategories(): CategoryDefinition[] {
    const stored = readPersistentSetting(CATEGORY_SETTINGS_KEY);

    if (!stored) {
        return mergeStoredCategories([]);
    }

    try {
        return mergeStoredCategories(JSON.parse(stored));
    } catch {
        return mergeStoredCategories([]);
    }
}

function normalizeCategoryUpdate(value?: string): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
}

export function UserSettingsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuthentication();
    const [googleCalendarEnabled, setGoogleCalendarEnabled] = useState(false);
    const [categories, setCategories] = useState<CategoryDefinition[]>(() => loadStoredCategories());
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        void requestPersistentStorage();
        writePersistentSetting(CATEGORY_SETTINGS_KEY, JSON.stringify(categories));
    }, [categories]);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoadingSettings(false);
            return;
        }

        setIsLoadingSettings(true);
        let isCancelled = false;

        async function loadUserSettings() {
            try {
                const response = await fetch(USER_SETTINGS_URL, {
                    method: "GET",
                    headers: await authHeaders(),
                });

                if (!response.ok) {
                    throw new Error(`Failed to load user settings: ${response.status}`);
                }

                const settings = await response.json();
                const nextEnableCalendar = settings?.googleCalendarEnabled ?? settings?.userSettings?.googleCalendarEnabled;

                if (!isCancelled && typeof nextEnableCalendar === "boolean") {
                    setGoogleCalendarEnabled(nextEnableCalendar);
                }

                if (!isCancelled) {
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
        const id = `custom-${crypto.randomUUID()}`;

        setCategories(prev => ([
            ...prev,
            {
                id,
                name: input.name.trim(),
                color: input.color,
                icon: normalizeCategoryUpdate(input.icon),
                isVisible: true,
                isBuiltIn: false,
                isDeleted: false,
            },
        ]));

        return id;
    }, []);

    const updateCategory = useCallback<UserSettingsContextValue['updateCategory']>((id, updates) => {
        setCategories(prev => prev.map(category => {
            if (category.id !== id) return category;

            return {
                ...category,
                name: normalizeCategoryUpdate(updates.name) ?? category.name,
                color: normalizeCategoryUpdate(updates.color) ?? category.color,
                icon: normalizeCategoryUpdate(updates.icon),
            };
        }));
    }, []);

    const setCategoryVisibility = useCallback<UserSettingsContextValue['setCategoryVisibility']>((id, isVisible) => {
        setCategories(prev => prev.map(category => {
            if (category.id !== id) return category;

            return {
                ...category,
                isVisible,
                isDeleted: category.isBuiltIn ? false : category.isDeleted,
            };
        }));
    }, []);

    const deleteCategory = useCallback<UserSettingsContextValue['deleteCategory']>((id) => {
        setCategories(prev => prev.map(category => {
            if (category.id !== id || category.isBuiltIn) return category;

            return {
                ...category,
                isVisible: false,
                isDeleted: true,
            };
        }));
    }, []);

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
