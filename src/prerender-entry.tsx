/* eslint-disable react-refresh/only-export-components */
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import LoggedOut from "src/pages/logged-out/LoggedOut";
import PrivacyPolicy from "src/pages/PrivacyPolicy";
import Templates from "src/pages/templates/Templates";
import ThemeCanvas from "src/app/ThemeCanvas";
import { AuthenticationContext, type AuthenticationContextType } from "src/authentication/authentication-context";
import { UserSettingsContext, type UserSettingsContextValue } from "src/user-settings/user-settings-context";
import { TaskContext } from "src/app/task-context";
import type { TaskContextType } from "src/app/types";
import { ToastContext } from "src/toast/toast-context";
import type { ToastContextType } from "src/toast/types";
import { DemoContext } from "src/pages/demo/DemoContext";
import { DEFAULT_CATEGORIES } from "src/category-select/category-constants";

const noop = () => undefined;
const asyncNoop = async () => undefined;

const authentication: AuthenticationContextType = {
    isLoading: true,
    isAuthenticated: false,
    login: asyncNoop,
    logout: noop,
    googleButtonState: "pending",
    setGoogleButtonState: noop,
    startGoogleReauth: async () => "",
};

const settings: UserSettingsContextValue = {
    googleCalendarEnabled: false,
    categories: DEFAULT_CATEGORIES,
    isLoadingSettings: true,
    updateEnableCalendar: asyncNoop,
    createCategory: () => "",
    updateCategory: noop,
    setCategoryVisibility: noop,
    deleteCategory: noop,
};

const tasks: TaskContextType = {
    itemLength: 0,
    items: [],
    isLoading: false,
    taskError: null,
    loadTasks: noop,
    addItem: asyncNoop,
    partialUpdateItem: asyncNoop,
    updateItem: asyncNoop,
    bulkUpdate: asyncNoop,
    deleteItem: noop,
    toggleItem: noop,
    prioritizeItem: noop,
    archiveItem: noop,
    sortItems: noop,
    reset: noop,
    getSubtasks: () => [],
    hideForToday: noop,
    unhideForToday: noop,
    loadDate: { current: null },
};

const toast: ToastContextType = {
    toasts: [],
    showToast: noop,
    removeToast: noop,
};

function PublicProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthenticationContext.Provider value={authentication}>
            <UserSettingsContext.Provider value={settings}>
                <TaskContext.Provider value={tasks}>
                    <ToastContext.Provider value={toast}>
                        <DemoContext.Provider value={{ items: [], setItems: noop, resetDemo: noop }}>
                            {children}
                        </DemoContext.Provider>
                    </ToastContext.Provider>
                </TaskContext.Provider>
            </UserSettingsContext.Provider>
        </AuthenticationContext.Provider>
    );
}

export function render(path: string): string {
    let page: React.ReactNode;

    switch (path) {
        case "/":
            page = <LoggedOut isCheckingSession onSuccessfulLogin={asyncNoop} />;
            break;
        case "/privacy-policy":
            page = <PrivacyPolicy />;
            break;
        case "/templates":
            page = <Templates />;
            break;
        default:
            throw new Error(`Cannot prerender unknown public route: ${path}`);
    }

    return renderToString(
        <Router ssrPath={path}>
            <PublicProviders>
                <ThemeCanvas />
                {page}
            </PublicProviders>
        </Router>,
    );
}
