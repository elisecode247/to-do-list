import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";
import {
    Check,
    ChevronDown,
    Eraser,
    Eye,
    EyeOff,
    ListFilter,
    PencilIcon,
    Palette,
    Plus,
    RefreshCcw,
    X
} from "lucide-react";

import EditTaskForm from "src/edit-task-form/EditTaskForm";
import type { ChecklistItem, Mode } from "src/app/types";
import ErrorState from "src/error-state/ErrorState";
import { useToast } from "src/toast/use-toast";
import Toast from "src/toast/Toast";
import SparklesOverlay from "src/app/SparklesOverlay";
import { useThemeOverride } from "src/themes/use-theme-override";
import AppToolBar from "src/app-toolbar/AppToolbar";
import ViewBreadcrumb from "src/app-toolbar/ViewBreadcrumb";
import {
    VIEW_JOURNAL,
    VIEW_SEARCH,
    TAB_TODAY,
    VIEW_LABELS,
    VIEWS,
    type ListTab,
    type View,
    VIEW_LIST,
} from "src/app-toolbar/tabs/types";
import MobileViewContent from "src/app-toolbar/tabs/MobileViewContent";
import Search from "src/app-toolbar/Search";
import { ALL_CATEGORIES, DEFAULT_CATEGORIES } from "src/category-select/category-constants";
import { ALL_MODES } from "src/checklist/constants";
import useIsDesktop from "src/pages/use-is-desktop";
import IconButton from "src/components/icon-button/IconButton";
import Footer from "src/footer/Footer";
import GoogleLoginButton from "src/authentication/google-login-button";
import Journal from "src/journal/Journal";
import DemoChecklist from "./DemoChecklist";
import AddForm from "./DemoAddForm";
import { useDemoTask } from "./use-demo-task";
import { DemoJournalProvider } from "./demo-journal-provider";
import AppearanceSettings from "src/pages/user-settings/AppearanceSettings";
import "src/pages/user-settings/user-settings.css";
import "src/pages/logged-in/logged-in.css";
import "./demo.css";
import { DARK_MODE, SPACE_STYLE, COMFORTABLE_DENSITY, GRAPHICS_TRUE } from "src/themes/constants";
import GettingStartedDialog from "src/onboarding/GettingStartedDialog";
import { readPersistentSetting, writePersistentSetting } from "src/utilities/persistent-storage";
import { ROUTES } from "src/router";
import { useLocation } from "wouter";

const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];
const DEMO_ONBOARDING_CHOICE_KEY = "daily-reset-list-demo-onboarding-choice-v1";

interface DemoPageProps {
    onSuccessfulLogin: (token: string) => void;
}

const DemoPage: React.FC<DemoPageProps> = ({
    onSuccessfulLogin,
}) => {
    useThemeOverride(DARK_MODE, SPACE_STYLE, COMFORTABLE_DENSITY, GRAPHICS_TRUE);
    const now = new Date();
    const dayOfWeekName = `${daysOfWeek[now.getDay()]}, `;

    const { toasts, showToast, removeToast } = useToast();
    const { items, clear, reset, isLoading, taskError, loadTasks, updateItem, loadDate } = useDemoTask();
    const [, setLocation] = useLocation();
    const isDesktop = useIsDesktop();
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [activeView, setActiveView] = useState<View>(VIEW_LIST);
    const [activeTab, setActiveTab] = useState<ListTab>(TAB_TODAY);
    const [hideCompleted, setHideCompleted] = useState(true);
    const [modeFilter, setModeFilter] = useState<Mode | typeof ALL_MODES>(ALL_MODES);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const [leftOpen, setLeftOpen] = useState(isDesktop);
    const [rightOpen, setRightOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [appearanceOpen, setAppearanceOpen] = useState(false);
    const [showGettingStarted, setShowGettingStarted] = useState(false);
    const lastUpdatedRaw = loadDate && "current" in loadDate ? loadDate.current : null;
    const lastUpdatedDate = lastUpdatedRaw ? new Date(lastUpdatedRaw) : null;
    const itemLength = items?.length ?? 0;
    const sparkles = <SparklesOverlay />;
    const appliedFilterCount = activeView === VIEW_LIST
        ? Number(hideCompleted) +
            Number(modeFilter !== ALL_MODES) +
            Number(filterCategory !== ALL_CATEGORIES)
        : 0;

    useEffect(() => {
        if (!isLoading && !readPersistentSetting(DEMO_ONBOARDING_CHOICE_KEY)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowGettingStarted(true);
        }
    }, [isLoading]);

    function completeGettingStarted() {
        writePersistentSetting(DEMO_ONBOARDING_CHOICE_KEY, "complete");
        setShowGettingStarted(false);
    }

    function startFromScratch() {
        completeGettingStarted();
        clear();
        setEditingItem(null);
        setLeftOpen(false);
        setRightOpen(true);
    }

    function chooseTemplate() {
        completeGettingStarted();
        setLocation(`${ROUTES.templates}?demo=1`);
    }

    function startWithDemoTasks() {
        completeGettingStarted();
        reset();
        setEditingItem(null);
        setActiveTab(TAB_TODAY);
        setRightOpen(false);
    }

    async function handleSave(saveItem: ChecklistItem) {
        if (!editingItem) return;
        setIsSaving(true);
        try {
            await updateItem(saveItem);
            showToast("Task updated successfully", "success");
        } catch (error) {
            if (error instanceof Error && error.message) {
                showToast(`Failed to update task: ${error.message}`, "error");
            } else {
                showToast("Failed to update task. Please try again.", "error");
            }
            throw error;
        } finally {
            setIsSaving(false);
        }
    }

    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
        setRightOpen(true);
        if (!isDesktop) setLeftOpen(false);
    }
    function handleViewChange(view: View) {
        setActiveView(view);
    }

    function handleTabChange(tab: ListTab) {
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
            if (!isDesktop && next) setRightOpen(false);
            return next;
        });
    }
    function toggleRight() {
        setRightOpen(current => {
            const next = !current;
            if (!isDesktop && next) setLeftOpen(false);
            return next;
        });
    }

    function toggleAddForm() {
        if (editingItem) {
            setEditingItem(null);
            return;
        }
        if (leftOpen && isDesktop && window.innerWidth > 900 && window.innerWidth < 1200) {
            setLeftOpen(false);
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
        setActiveTab(TAB_TODAY);
        setRightOpen(false);
        showToast("Demo tasks restored", "success");
    }
    function handleClear() {
        const confirmed = window.confirm("Clear all demo tasks? This cannot be undone.");
        if (!confirmed) return;
        clear();
        setEditingItem(null);
        setRightOpen(false);
        showToast("Demo tasks cleared", "success");
    }

    const mobileViews: View[] = [VIEWS.search, VIEWS.journal, VIEWS.list];
    const mobileTabBarRef = useRef<HTMLElement | null>(null);
    const mobileTabButtonRefs = useRef<Partial<Record<View, HTMLButtonElement | null>>>({});
    const [mobileIndicator, setMobileIndicator] = useState<{ x: number; width: number } | null>(null);
    const updateMobileIndicator = useCallback(() => {
        const barElement = mobileTabBarRef.current;
        const activeElement = mobileTabButtonRefs.current[activeView];
        if (!barElement || !activeElement) return;
        const nextIndicator = {
            x: activeElement.offsetLeft + 6,
            width: Math.max(0, activeElement.offsetWidth - 12),
        };

        setMobileIndicator(current =>
            current?.x === nextIndicator.x && current.width === nextIndicator.width
                ? current
                : nextIndicator
        );
    }, [activeView]);

    useLayoutEffect(() => {
        if (!isDesktop && !leftOpen && !rightOpen) {
            updateMobileIndicator();
        }
    }, [isDesktop, leftOpen, rightOpen, updateMobileIndicator]);

    useEffect(() => {
        window.addEventListener("resize", updateMobileIndicator);
        return () => window.removeEventListener("resize", updateMobileIndicator);
    }, [updateMobileIndicator]);
    useEffect(() => {
        const maybeCloseLeftPanel = () => {
            const width = window.innerWidth;
            if (leftOpen && rightOpen && width > 900 && width < 1200) {
                setLeftOpen(false);
            }
        };

        maybeCloseLeftPanel();
        window.addEventListener('resize', maybeCloseLeftPanel);
        return () => window.removeEventListener('resize', maybeCloseLeftPanel);
    }, [leftOpen, rightOpen]);

    return (
        <>
            <GettingStartedDialog
                isOpen={showGettingStarted}
                onStartFromScratch={startFromScratch}
                onChooseTemplate={chooseTemplate}
                onStartWithDemoTasks={startWithDemoTasks}
            />
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
            <div className={["app_container", leftOpen ? "left-open" : "", rightOpen ? "right-open" : ""].filter(Boolean).join(" ")}>
                {(leftOpen || rightOpen) && (
                    <div className="panel_backdrop" onClick={() => { setLeftOpen(false); setRightOpen(false); }} />
                )}

                <header className="app_header demo-app_header">
                    <div className={`mobile-action-rail ${(leftOpen || rightOpen) && !isDesktop ? "mobile-action-rail--hidden" : ""}`}>
                        <ViewBreadcrumb
                            activeView={activeView}
                            activeTab={activeTab}
                            appliedFilterCount={appliedFilterCount}
                            placement="mobile"
                        />
                        {activeView === VIEW_LIST && (
                            <>
                                <IconButton
                                    className="filter-toggle-button"
                                    onClick={toggleLeft}
                                    label="Filters"
                                    ariaLabel="Toggle filters"
                                    icon={<ListFilter size={24} />}
                                    showLabel={true}
                                    isPriority={false}
                                />
                                {!isDesktop ? (
                                    <IconButton
                                        className="show-completed-toggle-button"
                                        onClick={() => setHideCompleted(current => !current)}
                                        label={hideCompleted ? "Show completed" : "Hide completed"}
                                        ariaLabel={hideCompleted ? "Show completed tasks" : "Hide completed tasks"}
                                        icon={hideCompleted ? <EyeOff size={24} /> : <Eye size={24} />}
                                        showLabel={false}
                                        isPriority={false}
                                    />
                                ) : null}
                            </>
                        )}
                    </div>
                    {activeView === VIEW_LIST && (
                            <IconButton
                                className="new-task-form-toggle-button"
                                onClick={toggleAddForm}
                                label="Add new task"
                                ariaLabel="Add new task"
                                icon={<Plus size={24} strokeWidth={3} />}
                                isPriority
                                showLabel={false}
                            />
                    )}

                    <div className="app_header_title">
                        <h1 className="app_h1">
                            Daily Reset List
                        </h1>

                        <p className="app_subtitle">
                            <span>
                                {
                                    dayOfWeekName
                                }
                                {now.toLocaleDateString(
                                    undefined,
                                    {
                                        month:
                                            "long",
                                        day:
                                            "numeric",
                                    },
                                )}
                            </span>

                            <span className="app_subtitle_last-updated">
                                {lastUpdatedDate
                                    ? `Updated ${lastUpdatedDate.toLocaleTimeString(
                                        [],
                                        {
                                            hour:
                                                "2-digit",
                                            minute:
                                                "2-digit",
                                        },
                                    )}`
                                    : ""}

                                {lastUpdatedDate && (
                                    <Check
                                        className="app_subtitle_last-updated_fresh_icon"
                                        size={12}
                                        strokeWidth={
                                            3
                                        }
                                    />
                                )}
                            </span>
                        </p>
                    </div>

                    <div className="demo-header-actions">
                        <GoogleLoginButton onSuccess={onSuccessfulLogin} />
                        {activeView === VIEW_LIST && (
                            <Menu>
                                <MenuButton className="icon-button">
                                    Demo
                                    <ChevronDown size={14} strokeWidth={2.5} />
                                </MenuButton>
                                <MenuItems anchor="bottom end" transition className="demo-actions-menu-items">
                                    <MenuItem>
                                        <button className="demo-actions-menu-item" onClick={() => setAppearanceOpen(true)}>
                                            <Palette size={15} strokeWidth={2} />
                                            Appearance
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="demo-actions-menu-item" onClick={() => setLocation(`${ROUTES.templates}?demo=1`)}>
                                            <PencilIcon size={15} strokeWidth={2} />
                                            Templates
                                        </button>
                                    </MenuItem>
                                    <div className="demo-actions-menu-divider" role="separator" />
                                    <MenuItem>
                                        <button className="demo-actions-menu-item" onClick={handleReset}>
                                            <RefreshCcw size={15} strokeWidth={2} />
                                            Reset demo tasks
                                        </button>
                                    </MenuItem>
                                    <MenuItem>
                                        <button className="demo-actions-menu-item demo-actions-menu-item--danger" onClick={handleClear}>
                                            <Eraser size={15} strokeWidth={2} />
                                            Clear all tasks
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        )}
                    </div>
                </header>

                <aside className="left_panel">
                    <AppToolBar
                        categories={DEFAULT_CATEGORIES}
                        activeView={activeView}
                        activeTab={activeTab}
                        handleViewChange={handleViewChange}
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
                            key={activeView}
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
                                    message={
                                        taskError
                                    }
                                    onRetry={
                                        loadTasks
                                    }
                                />
                            ) : activeView === VIEW_JOURNAL ? (
                                <DemoJournalProvider>
                                    <Journal />
                                </DemoJournalProvider>
                            ) : activeView === VIEW_SEARCH ? (
                                <Search
                                    items={items}
                                    onEditItem={handleEditItem}
                                    sparkles={sparkles}
                                    renderResults={searchResults => (
                                        <DemoChecklist
                                            itemsOverride={searchResults}
                                            onEditItem={handleEditItem}
                                            sparkles={sparkles}
                                            activeTab={TAB_TODAY}
                                            modeFilter={ALL_MODES}
                                            hideCompleted={false}
                                            filterCategory={ALL_CATEGORIES}
                                            clearFilters={clearFilters}
                                        />
                                    )}
                                />
                            ) : itemLength ===
                                0 ? (
                                <div className="empty-state">
                                    <h2>Welcome to Daily Reset List!</h2>
                                    <div>
                                        <p>Add a task or restore the demo starter tasks.</p>
                                        <div className="demo-empty-actions">
                                            <button
                                                className="empty-state-create-button"
                                                onClick={
                                                    toggleAddForm
                                                }
                                            >
                                                Add your first task
                                            </button>
                                            <button
                                                className="settings-btn empty-state-secondary-button"
                                                onClick={
                                                    handleReset
                                                }
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
                        <EditTaskForm categories={DEFAULT_CATEGORIES} key={editingItem.id} isSaving={isSaving} formData={editingItem} onSave={handleSave} onClose={handleCloseEditForm} />
                    ) : rightOpen ? (
                        <AddForm categories={DEFAULT_CATEGORIES} isDesktop={isDesktop} setRightOpen={setRightOpen} />
                    ) : null}
                </aside>
                {!isDesktop && !leftOpen && !rightOpen && (
                    <nav className="mobile-tab-bar" ref={mobileTabBarRef}>
                        {mobileIndicator ? (
                            <motion.span
                                className="mobile-tab-motion"
                                initial={false}
                                animate={{ x: mobileIndicator.x, width: mobileIndicator.width }}
                                transition={{ type: "spring", stiffness: 580, damping: 44 }}
                            />
                        ) : null}
                        {mobileViews.map(view => (
                            <button aria-label={VIEW_LABELS[view]} key={view} ref={element => { mobileTabButtonRefs.current[view] = element; }} className={["mobile-tab-button", activeView === view ? "mobile-tab-button--active" : ""].filter(Boolean).join(" ")} onClick={() => handleViewChange(view)}>
                                <span className="mobile-tab-button-content">
                                    <MobileViewContent view={view} />
                                </span>
                            </button>
                        ))}
                    </nav>
                )}
                <Footer />
                <Dialog
                    open={appearanceOpen}
                    onClose={() => setAppearanceOpen(false)}
                    className="demo-appearance-dialog"
                >
                    <DialogBackdrop transition className="demo-appearance-dialog-backdrop" />
                    <div className="demo-appearance-dialog-positioner">
                        <DialogPanel transition className="demo-appearance-dialog-panel">
                            <div className="demo-appearance-dialog-header">
                                <DialogTitle className="demo-appearance-dialog-title">
                                    Appearance settings
                                </DialogTitle>
                                <button
                                    className="demo-appearance-dialog-close"
                                    type="button"
                                    onClick={() => setAppearanceOpen(false)}
                                    aria-label="Close appearance settings"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <AppearanceSettings />
                        </DialogPanel>
                    </div>
                </Dialog>
            </div>
        </>
    );
};
export default DemoPage;
