/* eslint-disable react-refresh/only-export-components */
import { renderToString } from "react-dom/server";
import { Suspense } from "react";
import { Router } from "wouter";
import LoggedOut from "src/pages/logged-out/LoggedOut";
import PrivacyPolicy from "src/pages/PrivacyPolicy";
import Templates from "src/pages/templates/Templates";
import ThemeCanvas from "src/app/ThemeCanvas";
import { AuthenticationContext, type AuthenticationContextType } from "src/authentication/authentication-context";
import { UserSettingsContext, type UserSettingsContextValue } from "src/user-settings/user-settings-context";
import { TaskContext } from "src/app/task-context";
import type { TaskContextType } from "src/app/types";
import { ToastProvider } from "src/toast/toast-provider";
import { DemoContext } from "src/pages/demo/DemoContext";
import { DemoTaskContext, type DemoTaskContextType } from "src/pages/demo/demo-task-context";
import { DEFAULT_CATEGORIES } from "src/category-select/category-constants";
import { ThemeProvider } from "src/themes/ThemeProvider";

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
    interstitialJournalEnabled: true,
    updateInterstitialJournalEnabled: asyncNoop,
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

const demoTasks: DemoTaskContextType = {
    ...tasks,
    clear: noop,
};

function PublicProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
        <AuthenticationContext.Provider value={authentication}>
            <UserSettingsContext.Provider value={settings}>
                <TaskContext.Provider value={tasks}>
                    <ToastProvider>
                        <DemoContext.Provider value={{ items: [], setItems: noop, resetDemo: noop }}>
                            <DemoTaskContext.Provider value={demoTasks}>
                                {children}
                            </DemoTaskContext.Provider>
                        </DemoContext.Provider>
                    </ToastProvider>
                </TaskContext.Provider>
            </UserSettingsContext.Provider>
        </AuthenticationContext.Provider>
        </ThemeProvider>
    );
}

export function render(path: string): string {
    let page: React.ReactNode;

    switch (path) {
        case "/":
            page = <LoggedOut onSuccessfulLogin={asyncNoop} />;
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
                {/* Keep this boundary in sync with App.tsx so the client can
                    hydrate the prerendered route instead of replacing it. */}
                <Suspense>{page}</Suspense>
            </PublicProviders>
        </Router>,
    );
}
