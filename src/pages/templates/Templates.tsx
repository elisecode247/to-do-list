import { useMemo, useState } from "react";
import Page from "src/pages/Page";
import { useTask } from "src/app/use-task";
import { useToast } from "src/toast/use-toast";
import type { ChecklistItem, Mode } from "src/app/types";
import { TABS, type Tab } from "src/app-toolbar/tabs/types";
import Checklist from "src/checklist/Checklist";
import EditTaskForm from "src/edit-task-form/EditTaskForm";
import { useAuthentication } from "src/authentication/use-authentication";
import type { CategoryDefinition } from "src/category-select/types";
import { useUserSettings } from "src/user-settings/use-user-settings";
import {
    CLEAN_BATHROOMS_TEMPLATE,
    CLEAN_BEDROOM_TEMPLATE,
    CLEAN_HALLS_AND_STAIRS_TEMPLATE,
    CLEAN_KITCHEN_TEMPLATE,
    CLEAN_LIVING_ROOM_TEMPLATE,
    CLEAN_OUTSIDE_TEMPLATE,
    DAILY_CLEANING_TEMPLATE,
} from './templates-housework';
import {
    BEDTIME_ROUTINE_TEMPLATE,
    GO_FOR_A_WALK_TEMPLATE,
    MORNING_RESET_TEMPLATE,
} from './templates-self-care';
import { CAT_CARE_TEMPLATE, DOG_CARE_TEMPLATE } from './templates-pets';
import {
    END_WORKDAY_TEMPLATE,
    FOCUS_SESSION_TEMPLATE,
    START_WORKDAY_TEMPLATE,
    WEEKLY_WORK_RESET_TEMPLATE,
} from './templates-work';
import {
    COORDINATE_HOUSEHOLD_TEMPLATE,
    PREPARE_APPOINTMENT_TEMPLATE,
    RSVP_AND_PREPARE_EVENT_TEMPLATE,
    RETURN_BORROWED_ITEM_TEMPLATE,
    SCHEDULE_APPOINTMENT_TEMPLATE,
} from './templates-people';
import {
    HOBBY_SESSION_TEMPLATE,
    PLAN_DAY_TRIP_TEMPLATE,
    PLAN_LEISURE_OUTING_TEMPLATE,
} from './templates-leisure';

import { DEFAULT_CATEGORIES } from "src/category-select/category-constants";
import { addTasksFromTemplate, type AddTasksFromTemplateRequest } from "src/app/api";
import "./templates-page.css";

type TemplateCategoryKey = "housework" | "self-care" | "pets" | "work" | "people" | "leisure";

interface TaskTemplate {
    id: string;
    title: string;
    description: string;
    categoryKey: TemplateCategoryKey;
    mode: Mode;
    subtasks: string[];
    items?: ChecklistItem[];
}

const TASK_TEMPLATES: TaskTemplate[] = [
    { id: "daily-cleaning", title: "Daily Cleaning", description: "A checklist for daily cleaning tasks.", categoryKey: "housework", mode: "daily", subtasks: [], items: DAILY_CLEANING_TEMPLATE },
    { id: "clean-bathrooms", title: "Clean bathrooms", description: "Recurring bathroom cleaning tasks with realistic individual schedules.", categoryKey: "housework", mode: "occasional", subtasks: [], items: CLEAN_BATHROOMS_TEMPLATE },
    { id: "clean-living-room", title: "Clean living room", description: "A flexible living-room reset with weekly and seasonal cleaning tasks.", categoryKey: "housework", mode: "occasional", subtasks: [], items: CLEAN_LIVING_ROOM_TEMPLATE },
    { id: "clean-kitchen", title: "Clean kitchen", description: "A flexible kitchen reset with weekly upkeep and periodic deep-cleaning tasks.", categoryKey: "housework", mode: "occasional", subtasks: [], items: CLEAN_KITCHEN_TEMPLATE },
    { id: "clean-bedroom", title: "Clean bedroom", description: "A flexible bedroom reset with weekly upkeep and periodic deep-cleaning tasks.", categoryKey: "housework", mode: "occasional", subtasks: [], items: CLEAN_BEDROOM_TEMPLATE },
    { id: "clean-halls-and-stairs", title: "Clean halls and stairs", description: "A safety-first reset for halls, stairs, storage, and high-touch surfaces.", categoryKey: "housework", mode: "occasional", subtasks: [], items: CLEAN_HALLS_AND_STAIRS_TEMPLATE },
    { id: "clean-outside", title: "Clean outside", description: "A flexible outdoor reset for entrances, yard care, vehicles, storage, and annual maintenance.", categoryKey: "housework", mode: "occasional", subtasks: [], items: CLEAN_OUTSIDE_TEMPLATE },
    { id: "morning-reset", title: "Morning reset", description: "A gentle routine for meeting your needs and getting ready with less friction.", categoryKey: "self-care", mode: "daily", subtasks: [], items: MORNING_RESET_TEMPLATE },
    { id: "bedtime-routine", title: "Bedtime routine", description: "A gentle routine for closing open loops and transitioning into sleep.", categoryKey: "self-care", mode: "daily", subtasks: [], items: BEDTIME_ROUTINE_TEMPLATE },
    { id: "go-for-a-walk", title: "Go for a walk", description: "A flexible, activation-focused routine for preparing, walking, and returning home.", categoryKey: "self-care", mode: "daily", subtasks: [], items: GO_FOR_A_WALK_TEMPLATE },
    { id: "dog-care", title: "Dog care", description: "Daily care, walks, grooming, cleaning, and preventive health reminders for dogs.", categoryKey: "pets", mode: "daily", subtasks: [], items: DOG_CARE_TEMPLATE },
    { id: "cat-care", title: "Cat care", description: "Daily feeding, litter, enrichment, grooming, cleaning, and preventive health reminders for cats.", categoryKey: "pets", mode: "daily", subtasks: [], items: CAT_CARE_TEMPLATE },
    { id: "start-workday", title: "Start the workday", description: "A gentle daily routine for finding one useful starting point and beginning work.", categoryKey: "work", mode: "daily", subtasks: [], items: START_WORKDAY_TEMPLATE },
    { id: "end-workday", title: "End the workday", description: "A daily shutdown routine that leaves a clear handoff for tomorrow.", categoryKey: "work", mode: "daily", subtasks: [], items: END_WORKDAY_TEMPLATE },
    { id: "weekly-work-reset", title: "Weekly work reset", description: "A realistic weekly review for deadlines, projects, blockers, and capacity.", categoryKey: "work", mode: "occasional", subtasks: [], items: WEEKLY_WORK_RESET_TEMPLATE },
    { id: "focus-session", title: "Focus session", description: "A bounded, on-demand session for starting, focusing, and leaving a clear next action.", categoryKey: "work", mode: "one-time", subtasks: [], items: FOCUS_SESSION_TEMPLATE },
    { id: "coordinate-household", title: "Coordinate household or family logistics", description: "A weekly reset for shared schedules, responsibilities, transportation, and care.", categoryKey: "people", mode: "occasional", subtasks: [], items: COORDINATE_HOUSEHOLD_TEMPLATE },
    { id: "schedule-appointment", title: "Schedule an appointment", description: "An on-demand workflow for booking, recording, and following up on an appointment.", categoryKey: "people", mode: "one-time", subtasks: [], items: SCHEDULE_APPOINTMENT_TEMPLATE },
    { id: "prepare-appointment", title: "Prepare for an appointment", description: "An on-demand checklist for instructions, documents, questions, access, and arrival.", categoryKey: "people", mode: "one-time", subtasks: [], items: PREPARE_APPOINTMENT_TEMPLATE },
    { id: "rsvp-prepare-event", title: "RSVP and prepare for an event", description: "An on-demand workflow for deciding, responding, and preparing to attend comfortably.", categoryKey: "people", mode: "one-time", subtasks: [], items: RSVP_AND_PREPARE_EVENT_TEMPLATE },
    { id: "return-borrowed-item", title: "Return a borrowed item", description: "A practical workflow for locating, preparing, and returning something to its owner.", categoryKey: "people", mode: "one-time", subtasks: [], items: RETURN_BORROWED_ITEM_TEMPLATE },
    { id: "hobby-session", title: "Hobby session", description: "An on-demand session with gentle start, during, and end phases.", categoryKey: "leisure", mode: "one-time", subtasks: [], items: HOBBY_SESSION_TEMPLATE },
    { id: "plan-day-trip", title: "Plan a day trip", description: "A practical planning workflow for a safe, enjoyable same-day trip.", categoryKey: "leisure", mode: "one-time", subtasks: [], items: PLAN_DAY_TRIP_TEMPLATE },
    { id: "plan-leisure-outing", title: "Plan a leisure outing", description: "A lighter planning workflow for local activities and enjoyable time away.", categoryKey: "leisure", mode: "one-time", subtasks: [], items: PLAN_LEISURE_OUTING_TEMPLATE },
];

function makeItem(overrides: Partial<ChecklistItem>): ChecklistItem {
    return {
        itemType: "checklist-item", id: crypto.randomUUID(), text: "", done: false,
        lastCompleted: "", note: "", sortOrder: 0, tabSortOrder: {}, category: "housework",
        mode: "one-time", isPriority: false, isArchived: false, isHidden: false,
        hasSubChores: false, parentUuid: null, recurrence: null, nextDue: null, ...overrides,
    };
}

function resolveCategoryId(
    categoryKey: TemplateCategoryKey,
    categories: CategoryDefinition[],
    isAuthenticated: boolean,
): string {
    if (!isAuthenticated) return categoryKey;

    return categories.find(category =>
        category.isBuiltIn && (category.builtInKey === categoryKey || category.id === categoryKey)
    )?.id ?? categoryKey;
}

function buildPreview(template: TaskTemplate, categoryId: string = template.categoryKey): ChecklistItem[] {
    if (template.items) {
        const idMap = new Map(template.items.map(item => [item.id, crypto.randomUUID()]));
        return template.items.map(item => ({
            ...item,
            id: idMap.get(item.id)!,
            category: categoryId,
            parentUuid: item.parentUuid ? idMap.get(item.parentUuid) ?? null : null,
        }));
    }

    const parent = makeItem({ text: template.title, note: template.description, category: categoryId, mode: template.mode, hasSubChores: template.subtasks.length > 0 });
    return [parent, ...template.subtasks.map((text, index) => makeItem({ text, sortOrder: index, category: categoryId, mode: template.mode, parentUuid: parent.id }))];
}

function getSubtaskCount(template: TaskTemplate): number {
    return template.items?.filter(item => item.parentUuid !== null).length ?? template.subtasks.length;
}

export default function TemplatesPage() {
    const task = useTask();
    const { showToast } = useToast();
    const { isAuthenticated } = useAuthentication();
    const { categories: userCategories } = useUserSettings();
    const categories = !isAuthenticated ? DEFAULT_CATEGORIES : userCategories;
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryKey | "all">("all");
    const [selectedTemplateId, setSelectedTemplateId] = useState(TASK_TEMPLATES[0].id);
    const [previewItems, setPreviewItems] = useState<ChecklistItem[]>(() => buildPreview(
        TASK_TEMPLATES[0],
        resolveCategoryId(TASK_TEMPLATES[0].categoryKey, categories, isAuthenticated),
    ));
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const templates = useMemo(() => selectedCategory === "all" ? TASK_TEMPLATES : TASK_TEMPLATES.filter(t => t.categoryKey === selectedCategory), [selectedCategory]);
    const selectedTemplate = TASK_TEMPLATES.find(t => t.id === selectedTemplateId)!;

    function selectTemplate(template: TaskTemplate) {
        setSelectedTemplateId(template.id);
        setPreviewItems(buildPreview(
            template,
            resolveCategoryId(template.categoryKey, categories, isAuthenticated),
        ));
        setEditingItem(null);
    }

    function updateItem(partial: Partial<ChecklistItem>) {
        setPreviewItems(items => items.map(item => item.id === partial.id ? { ...item, ...partial } : item));
    }

    function deleteItem(id: string) {
        setPreviewItems(items => items.filter(item => item.id !== id && item.parentUuid !== id));
    }

    function sortItems(_visibleItems: ChecklistItem[], _tab: Tab, activeId: string, overId: string) {
        setPreviewItems(current => {
            const activeItem = current.find(item => item.id === activeId);
            const overItem = current.find(item => item.id === overId);
            if (!activeItem || !overItem || activeItem.parentUuid !== overItem.parentUuid) return current;

            const siblings = current
                .filter(item => item.parentUuid === activeItem.parentUuid)
                .sort((a, b) => a.sortOrder - b.sortOrder);
            const oldIndex = siblings.findIndex(item => item.id === activeId);
            const newIndex = siblings.findIndex(item => item.id === overId);
            if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return current;

            const reordered = [...siblings];
            const [moved] = reordered.splice(oldIndex, 1);
            reordered.splice(newIndex, 0, moved);
            const sortOrderById = new Map(reordered.map((item, index) => [item.id, index]));

            return current.map(item => sortOrderById.has(item.id)
                ? { ...item, sortOrder: sortOrderById.get(item.id)! }
                : item);
        });
    }

    async function addToList() {
        setIsAdding(true);
        try {
            const parentItem = previewItems.find(item => item.parentUuid === null);
            if (!parentItem) {
                throw new Error("Template must include a parent chore");
            }

            const toTemplateChore = (item: ChecklistItem): AddTasksFromTemplateRequest["parent"] => {
                const category = isAuthenticated
                    ? resolveCategoryId(item.category as TemplateCategoryKey, categories, true)
                    : item.category;
                const { id: _id, parentUuid: _parentUuid, ...chore } = item;
                void _id;
                void _parentUuid;
                return {
                    ...chore,
                    category,
                    done: false,
                    isArchived: false,
                    isHidden: false,
                };
            };

            await addTasksFromTemplate({
                parent: toTemplateChore(parentItem),
                subChores: previewItems
                    .filter(item => item.parentUuid === parentItem.id)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(toTemplateChore),
            });
            task.loadTasks();
            showToast(`Added "${parentItem.text}" to your checklist`, "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to add template. Please try again.", "error");
        } finally {
            setIsAdding(false);
        }
    }

    const controller = {
        isLoading: false,
        items: previewItems,
        addItem: (item: ChecklistItem) => setPreviewItems(items => [...items, item].map(candidate => candidate.id === item.parentUuid ? { ...candidate, hasSubChores: true } : candidate)),
        partialUpdateItem: updateItem,
        deleteItem,
        toggleItem: (id: string, checked: boolean) => updateItem({ id, done: checked, lastCompleted: checked ? new Date().toISOString() : "" }),
        prioritizeItem: (id: string) => { const item = previewItems.find(candidate => candidate.id === id); if (item) updateItem({ id, isPriority: !item.isPriority }); },
        archiveItem: (id: string) => { const item = previewItems.find(candidate => candidate.id === id); if (item) updateItem({ id, isArchived: !item.isArchived }); },
        sortItems,
        getSubtasks: (id: string) => previewItems.filter(item => item.parentUuid === id).sort((a, b) => a.sortOrder - b.sortOrder),
        hideForToday: (id: string) => updateItem({ id, isHidden: true }),
        unhideForToday: (id: string) => updateItem({ id, isHidden: false }),
        loadTasks: () => undefined,
        hideEventForToday: () => undefined,
        unhideEventForToday: () => undefined,
    };

    return (
        <Page title="Task templates">
            <div className="templates-page">
                <aside className="templates-sidebar" aria-label="Task templates">
                    <h2>Templates</h2>
                    <div className="templates-page_filters">
                        {["all", "housework", "self-care", "pets", "work", "people", "leisure"].map(category => (
                            <button key={category} className={`template-filter ${selectedCategory === category ? "template-filter--active" : ""}`} onClick={() => setSelectedCategory(category as TemplateCategoryKey | "all")} type="button">{category === "all" ? "All" : category}</button>
                        ))}
                    </div>
                    <div className="template-list">
                        {templates.map(template => (
                            <button key={template.id} type="button" className={`template-list_item ${selectedTemplateId === template.id ? "template-list_item--active" : ""}`} onClick={() => selectTemplate(template)}>
                                <strong>{template.title}</strong><span>{getSubtaskCount(template)} subtasks · {template.categoryKey}</span>
                            </button>
                        ))}
                    </div>
                </aside>
                <main className="template-preview">
                    <div className="template-preview_header">
                        <div><p className="template-preview_eyebrow">Preview and customize</p><h2>{previewItems.find(item => !item.parentUuid)?.text ?? selectedTemplate.title}</h2><p>Use the task menu to edit, delete, or add subtasks before saving.</p></div>
                        <button className="template-card_button" type="button" disabled={isAdding || previewItems.length === 0} onClick={addToList}>{isAdding ? "Adding…" : "Add to my Daily Reset List"}</button>
                    </div>
                    <Checklist
                        checklistType="template"
                        controller={controller}
                        activeTab={TABS.today}
                        modeFilter="all"
                        hideCompleted={false}
                        filterCategory="all"
                        clearFilters={() => undefined}
                        onEditItem={setEditingItem}
                        enablePullToRefresh={false}
                    />
                </main>
                {editingItem && (
                    <div className="template-edit-overlay">
                    <EditTaskForm
                        categories={categories}
                        formData={editingItem}
                        onSave={item => updateItem(item)}
                        onClose={() => setEditingItem(null)}
                    />

                    </div>
                )}
            </div>
        </Page>
    );
}
