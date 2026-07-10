import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type SetStateAction,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Check,
    Eraser,
    Eye,
    EyeOff,
    ListFilter,
    Plus,
    RefreshCcw,
} from "lucide-react";

import type { ChecklistItem, Mode } from "src/app/types";
import EditTaskForm from "src/edit-task-form/EditTaskForm";
import ErrorState from "src/error-state/ErrorState";
import SparklesOverlay from "src/app/SparklesOverlay";
import { useTheme } from "src/themes/use-theme";
import AppToolBar from "src/app-toolbar/AppToolbar";
import {
    TABS,
    TAB_LABELS,
    type Tab,
} from "src/app-toolbar/tabs/types";
import { ALL_CATEGORIES } from "src/category-select/category-constants";
import { ALL_MODES } from "src/checklist/constants";
import useIsDesktop from "src/pages/use-is-desktop";
import IconButton from "src/components/icon-button/IconButton";
import Footer from "src/footer/Footer";
import GoogleLoginButton from "src/authentication/google-login-button";
import Toast from "src/toast/Toast";
import { useToast } from "src/toast/use-toast";

import DemoChecklist from "./DemoChecklist";
import DemoAddForm from "./DemoAddForm";
import { useDemoTask } from "./use-demo-task";

import "src/pages/logged-in/logged-in.css";
import "./demo.css";

const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

interface DemoPageProps {
    onSuccessfulLogin: (token: string) => void;
}

const DemoPage: React.FC<DemoPageProps> = ({
    onSuccessfulLogin,
}) => {
    useTheme();

    const now = new Date();
    const dayOfWeekName = `${daysOfWeek[now.getDay()]}, `;

    const { toasts, showToast, removeToast } = useToast();

    const {
        items,
        clear,
        reset,
        isLoading,
        taskError,
        loadTasks,
        updateItem,
        loadDate,
    } = useDemoTask();

    const isDesktop = useIsDesktop();

    const [editingItem, setEditingItem] =
        useState<ChecklistItem | null>(null);

    const [activeTab, setActiveTab] = useState<Tab>(TABS.today);
    const [hideCompleted, setHideCompleted] = useState(true);

    const [modeFilter, setModeFilter] = useState<
        Mode | typeof ALL_MODES
    >(ALL_MODES);

    const [filterCategory, setFilterCategory] =
        useState<string>(ALL_CATEGORIES);

    const [leftOpen, setLeftOpen] = useState(isDesktop);
    const [rightOpen, setRightOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const lastUpdatedRaw =
        loadDate && "current" in loadDate
            ? loadDate.current
            : null;

    const lastUpdatedDate = lastUpdatedRaw
        ? new Date(lastUpdatedRaw)
        : null;

    /*
     * Prefer itemLength from useDemoTask if you add it there.
     * Until then, deriving it here is fine.
     */
    const itemLength = items?.length ?? 0;

    const sparkles = <SparklesOverlay />;

    async function handleSave(saveItem: ChecklistItem) {
        if (!editingItem) {
            return;
        }

        setIsSaving(true);

        try {
            await updateItem(saveItem);
            setEditingItem(null);
            showToast("Task updated successfully", "success");
        } catch (error) {
            const message =
                error instanceof Error && error.message
                    ? `Failed to update task: ${error.message}`
                    : "Failed to update task. Please try again.";

            showToast(message, "error");
        } finally {
            setIsSaving(false);
            setRightOpen(false);
        }
    }

    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
        setRightOpen(true);

        if (!isDesktop) {
            setLeftOpen(false);
        }
    }

    function handleTabChange(tab: SetStateAction<Tab>) {
        setActiveTab(tab);
    }

    function clearFilters() {
        setModeFilter(ALL_MODES);
        setFilterCategory(ALL_CATEGORIES);
        setHideCompleted(false);
    }

    function toggleLeft() {
        setLeftOpen(current => {
            const next = !current;

            if (!isDesktop && next) {
                setRightOpen(false);
            }

            return next;
        });
    }

    function toggleRight() {
        setRightOpen(current => {
            const next = !current;

            if (!isDesktop && next) {
                setLeftOpen(false);
            }

            return next;
        });
    }

    function toggleAddForm() {
        if (editingItem) {
            setEditingItem(null);
            return;
        }

        toggleRight();
    }

    function handleCloseEditForm() {
        setEditingItem(null);
        setRightOpen(false);
    }

    function handleReset() {
        reset();
        setEditingItem(null);
        setActiveTab(TABS.today);
        setRightOpen(false);

        showToast("Demo tasks restored", "success");
    }

    function handleClear() {
        const confirmed = window.confirm(
            "Clear all demo tasks? This cannot be undone.",
        );

        if (!confirmed) {
            return;
        }

        clear();
        setEditingItem(null);
        setRightOpen(false);

        showToast("Demo tasks cleared", "success");
    }

    /*
     * The demo has no journal, so only task-related tabs belong in
     * the mobile navigation.
     */
    const isSecondaryTabActive =
        activeTab === TABS.hidden ||
        activeTab === TABS.archived;

    const mobileTabs = useMemo<Tab[]>(() => {
        return isSecondaryTabActive
            ? [
                TABS.priority,
                TABS.today,
                TABS.upcoming,
                activeTab,
            ]
            : [
                TABS.priority,
                TABS.today,
                TABS.upcoming,
            ];
    }, [activeTab, isSecondaryTabActive]);

    const mobileTabBarRef = useRef<HTMLElement | null>(null);

    const mobileTabButtonRefs = useRef<
        Partial<Record<Tab, HTMLButtonElement | null>>
    >({});

    const [mobileIndicator, setMobileIndicator] = useState({
        x: 0,
        width: 0,
    });

    const updateMobileIndicator = useCallback(() => {
        const activeButton =
            mobileTabButtonRefs.current[activeTab];

        if (!mobileTabBarRef.current || !activeButton) {
            return;
        }

        setMobileIndicator({
            x: activeButton.offsetLeft,
            width: activeButton.offsetWidth,
        });
    }, [activeTab]);

    useEffect(() => {
        updateMobileIndicator();

        window.addEventListener(
            "resize",
            updateMobileIndicator,
        );

        return () => {
            window.removeEventListener(
                "resize",
                updateMobileIndicator,
            );
        };
    }, [updateMobileIndicator]);

    useEffect(() => {
        if (isDesktop || leftOpen || rightOpen) {
            return;
        }

        const frameId = window.requestAnimationFrame(
            updateMobileIndicator,
        );

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [
        isDesktop,
        leftOpen,
        rightOpen,
        mobileTabs,
        updateMobileIndicator,
    ]);

    const pageTransitionKey = isLoading
        ? "loading"
        : taskError
          ? "error"
          : itemLength === 0
            ? "empty"
            : activeTab;

    return (
        <>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}

            <div
                className={[
                    "app_container",
                    leftOpen ? "left-open" : "",
                    rightOpen ? "right-open" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {(leftOpen || rightOpen) && (
                    <div
                        className="panel_backdrop"
                        onClick={() => {
                            setLeftOpen(false);
                            setRightOpen(false);
                        }}
                    />
                )}

                <header className="app_header demo-app_header">
                    <IconButton
                        className={[
                            "filter-toggle-button",
                            (leftOpen || rightOpen) && !isDesktop
                                ? "hidden"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={toggleLeft}
                        label="Filters"
                        ariaLabel="Toggle filters"
                        icon={<ListFilter size={24} />}
                        showLabel={isDesktop}
                        isPriority={false}
                    />

                    {!isDesktop && (
                        <IconButton
                            className={[
                                "show-completed-toggle-button",
                                (leftOpen || rightOpen)
                                    ? "hidden"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={() =>
                                setHideCompleted(current => !current)
                            }
                            label={
                                hideCompleted
                                    ? "Completed Tasks Hidden"
                                    : "Completed Tasks Shown"
                            }
                            ariaLabel={
                                hideCompleted
                                    ? "Show completed tasks"
                                    : "Hide completed tasks"
                            }
                            icon={
                                hideCompleted
                                    ? <EyeOff size={24} />
                                    : <Eye size={24} />
                            }
                            isPriority={false}
                        />
                    )}

                    <div className="app_header_title">
                        <h1 className="app_h1">
                            Daily Reset List
                        </h1>

                        <p className="app_subtitle">
                            <span>
                                {dayOfWeekName}
                                {now.toLocaleDateString(undefined, {
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>

                            <span className="app_subtitle_last-updated">
                                {lastUpdatedDate
                                    ? `Updated ${lastUpdatedDate.toLocaleTimeString(
                                        [],
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        },
                                    )}`
                                    : ""}
                                {lastUpdatedDate && (
                                    <Check
                                        className="app_subtitle_last-updated_fresh_icon"
                                        size={12}
                                        strokeWidth={3}
                                    />
                                )}
                            </span>
                        </p>
                    </div>

                    <IconButton
                        className={[
                            "new-task-form-toggle-button",
                            (leftOpen || rightOpen) && !isDesktop
                                ? "hidden"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={toggleAddForm}
                        label="Add new task"
                        ariaLabel="Add new task"
                        icon={<Plus size={24} strokeWidth={3} />}
                        isPriority
                    />

                    <div className="demo-header-actions">
                        <IconButton
                            className={[
                                "header-button",
                                "demo-reset",
                                (leftOpen || rightOpen) &&
                                !isDesktop
                                    ? "hidden"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={handleReset}
                            label="Reset demo"
                            ariaLabel="Restore demo starter tasks"
                            icon={
                                <RefreshCcw
                                    size={20}
                                    strokeWidth={2.5}
                                />
                            }
                            showLabel={isDesktop}
                            isPriority={false}
                        />

                        <IconButton
                            className={[
                                "header-button",
                                "demo-clear",
                                (leftOpen || rightOpen) &&
                                !isDesktop
                                    ? "hidden"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={handleClear}
                            label="Clear"
                            ariaLabel="Clear all demo tasks"
                            icon={
                                <Eraser
                                    size={20}
                                    strokeWidth={2.5}
                                />
                            }
                            showLabel={isDesktop}
                            isPriority={false}
                        />

                        <GoogleLoginButton
                            onSuccess={onSuccessfulLogin}
                        />
                    </div>
                </header>

                <aside className="left_panel">
                    <AppToolBar
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                        modeFilter={modeFilter}
                        setModeFilter={setModeFilter}
                        hideCompleted={hideCompleted}
                        setHideCompleted={setHideCompleted}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        setLeftOpen={setLeftOpen}
                        isDesktop={isDesktop}
                    />
                </aside>

                <main className="main_content">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={pageTransitionKey}
                            className="main_content_page"
                            initial={{
                                opacity: 0,
                                y: 10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -8,
                            }}
                            transition={{
                                duration: 0.22,
                                ease: "easeOut",
                            }}
                        >
                            {isLoading ? (
                                <div className="app_loading-container">
                                    <div
                                        aria-busy="true"
                                        className="app_loading-spinner"
                                    />
                                    <p>Loading your tasks...</p>
                                </div>
                            ) : taskError ? (
                                <ErrorState
                                    message={taskError}
                                    onRetry={loadTasks}
                                />
                            ) : itemLength === 0 ? (
                                <div className="empty-state">
                                    <h2>
                                        Welcome to Daily Reset List!
                                    </h2>

                                    <div>
                                        <p>
                                            Add a task yourself or
                                            restore the demo starter
                                            tasks.
                                        </p>

                                        <div className="demo-empty-actions">
                                            <button
                                                className="empty-state-create-button"
                                                onClick={toggleAddForm}
                                            >
                                                Add your first task
                                            </button>

                                            <button
                                                className="empty-state-secondary-button"
                                                onClick={handleReset}
                                            >
                                                Restore demo tasks
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <DemoChecklist
                                    onEditItem={handleEditItem}
                                    sparkles={sparkles}
                                    activeTab={activeTab}
                                    modeFilter={modeFilter}
                                    hideCompleted={hideCompleted}
                                    filterCategory={filterCategory}
                                    clearFilters={clearFilters}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>

                <aside className="right_panel">
                    {rightOpen && editingItem ? (
                        <EditTaskForm
                            key={editingItem.id}
                            isSaving={isSaving}
                            formData={editingItem}
                            onSave={handleSave}
                            onClose={handleCloseEditForm}
                        />
                    ) : rightOpen ? (
                        <DemoAddForm />
                    ) : null}
                </aside>

                {!isDesktop && !leftOpen && !rightOpen && (
                    <nav
                        className="mobile-tab-bar"
                        ref={mobileTabBarRef}
                    >
                        <motion.span
                            className="mobile-tab-motion"
                            animate={{
                                x: mobileIndicator.x,
                                width: mobileIndicator.width,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 580,
                                damping: 44,
                            }}
                        />

                        {mobileTabs.map(tab => (
                            <button
                                key={tab}
                                ref={element => {
                                    mobileTabButtonRefs.current[tab] =
                                        element;
                                }}
                                className={[
                                    "mobile-tab-button",
                                    activeTab === tab
                                        ? "mobile-tab-button--active"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() =>
                                    handleTabChange(tab)
                                }
                            >
                                <span className="mobile-tab-button-content">
                                    {TAB_LABELS[tab]}
                                </span>
                            </button>
                        ))}
                    </nav>
                )}

                <Footer />
            </div>
        </>
    );
};

export default DemoPage;
