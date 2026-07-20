import { useState, useEffect } from "react";
import type { ChecklistItem } from "app/types";
import EditTaskForm from 'src/edit-task-form/EditTaskForm';
import Page from "src/pages/Page";
import '../page.css';
import './bulk-edit.css';
import { MODES } from "src/checklist/constants";
import { getCategoryOptions } from "src/category-select/category-constants";
import { useToast } from "src/toast/use-toast";
import { useTask } from "src/app/use-task";
import { useUserSettings } from "src/user-settings/use-user-settings";
import {
    canDeleteTask,
    canEditTask,
    canManageTaskMembers,
} from "src/sharing/chore-access";
import { isChoreAccessChangedError } from "src/app/api";

interface ChecklistItemWithDepth extends ChecklistItem {
    depth: number;
}

function BulkEdit() {
    const { showToast } = useToast();
    const { items, updateItem, deleteItem, bulkUpdate, loadTasks } = useTask();
    const { categories } = useUserSettings();

    const [localItems, setLocalItems] = useState<ChecklistItem[]>(items);
    const [showSubtasksFor, setShowSubtasksFor] = useState<Set<string>>(new Set());
    const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const filterTasks = () => {
        // Build parent → children map
        const parentMap = new Map<string, ChecklistItem[]>();
        localItems.forEach(item => {
            if (item.parentUuid) {
                if (!parentMap.has(item.parentUuid)) parentMap.set(item.parentUuid, []);
                parentMap.get(item.parentUuid)!.push(item);
            }
        });

        // Recursive function to push parent and all descendants
        const pushWithChildren = (item: ChecklistItem, arr: ChecklistItemWithDepth[], depth: number = 0) => {
            arr.push({ ...item, depth });

            const children = parentMap.get(item.id);
            if (children) {
                // Optional: sort children
                children.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
                children.forEach(child => pushWithChildren(child, arr, depth + 1));
            }
        };

        const sortedTasks: ChecklistItemWithDepth[] = [];
        localItems.forEach(item => {
            // only top-level tasks (no parent)
            if (!item.parentUuid) {
                pushWithChildren(item, sortedTasks, 0);
            }
        });

        // Filter subtasks based on expanded parents
        return sortedTasks.filter(item => {
            if (item.parentUuid) {
                return showSubtasksFor.has(item.parentUuid);
            }
            return true;
        });

    };

    const filteredTasks = filterTasks();
    const editableTaskCount = filteredTasks.filter(task =>
        canEditTask(task.accessRole)
    ).length;
    const completionOnlyTaskCount = filteredTasks.filter(task =>
        task.accessRole === 'doer'
    ).length;
    const viewOnlyTaskCount = filteredTasks.filter(task =>
        task.accessRole === 'viewer'
    ).length;

    const getChangedEditableTasks = () => localItems.filter(local => {
        if (!canEditTask(local.accessRole)) return false;

        const original = items.find(item => item.id === local.id);
        if (!original) return false;

        return (
            original.isArchived !== local.isArchived ||
            original.mode !== local.mode ||
            original.category !== local.category
        );
    });
    const hasEditableChanges = getChangedEditableTasks().length > 0;

    // Sync if tasks reload
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalItems(items);
    }, [items]);

    // add subtask rows below parent task when "View Subtasks" is clicked
    const displaySubtasks = (task: ChecklistItem) => {
        setShowSubtasksFor(prev => {
            const newSet = new Set(prev);
            if (newSet.has(task.id)) {
                newSet.delete(task.id);
            } else {
                newSet.add(task.id);
            }
            return newSet;
        });
    };

    const updateLocal = (
        id: string,
        field: keyof ChecklistItem,
        value: string | boolean
    ) => {
        setLocalItems(prev => {
            return prev.map(item => {
                if (item.id === id && !canEditTask(item.accessRole)) {
                    return item;
                }
                const updatedItem = item.id === id ? { ...item, [field]: value } : item;
                return updatedItem;
            });
        });
    };

    const handleSaveAll = async () => {
        setIsSaving(true);

        try {
            const changed = getChangedEditableTasks();
            if (changed.length === 0) {
                return;
            }

            await bulkUpdate(changed);
            showToast("All changes saved successfully.", "success");
        } catch (err) {
            console.error(err);
            if (isChoreAccessChangedError(err)) {
                setSelectedItem(null);
            } else if (err instanceof Error && err.message) {
                showToast(`Failed to save changes: ${err.message}`, "error");
            } else {
                showToast("Failed to save changes.", "error");
            }
            if (!isChoreAccessChangedError(err)) {
                loadTasks();
            }
        } finally {
            setIsSaving(false);
        }
    };

    async function handleDelete(task: ChecklistItem) {
        if (!canDeleteTask(task.accessRole)) {
            return;
        }

        try {
            const confirmed = confirm("Are you sure you want to delete this task? This action cannot be undone.");
            if (confirmed) {
                await deleteItem(task.id);
                showToast("Task deleted successfully.");
            }
        } catch (err) {
            console.error(err);
            if (!isChoreAccessChangedError(err)) {
                showToast("Failed to delete task. Please try again.");
            }
        }
    }

    return (
        <Page title="Bulk Edit Tasks">
            <div className="bulk-edit-container">
                <p>Total {filteredTasks.length} Tasks</p>
                <p className="bulk-edit-access-summary">
                    {editableTaskCount} editable
                    {completionOnlyTaskCount > 0
                        ? ` · ${completionOnlyTaskCount} completion-only`
                        : ''}
                    {viewOnlyTaskCount > 0
                        ? ` · ${viewOnlyTaskCount} view-only`
                        : ''}
                </p>
                {editableTaskCount === 0 && filteredTasks.length > 0 && (
                    <p className="bulk-edit-read-only-message" role="status">
                        These tasks are shared with you as view-only or completion-only.
                    </p>
                )}
                <div className="bulk-edit-table-container">
                    <table className="bulk_table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Task</th>
                                <th>Access</th>
                                <th>Archived</th>
                                <th>Mode</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task, index) => {
                                const categoryOptions = getCategoryOptions(categories, {
                                    includeNone: true,
                                    includeId: task.category,
                                });
                                const categoryValue = categoryOptions.some(option => option.value === task.category) ? task.category : '';
                                const canEdit = canEditTask(task.accessRole);
                                const accessDescriptionId = `bulk-task-access-${task.id}`;
                                return (
                                    <tr
                                        key={task.id}
                                        className="bulk-edit-task-row"
                                        data-depth={task.depth}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{task.id}</td>
                                        <td className={`bulk_task_cell ${canEdit ? 'bulk_task_cell--editable' : ''}`}>
                                            {canEdit ? (
                                                <button
                                                    className="bulk-task-edit-link"
                                                    type="button"
                                                    onClick={() => setSelectedItem(task)}
                                                >
                                                    {Array.from({ length: task.depth }).map((_, i) => (
                                                        <span key={i}>↳</span>
                                                    ))}
                                                    {task.text}
                                                </button>
                                            ) : (
                                                <>
                                                    {Array.from({ length: task.depth }).map((_, i) => (
                                                        <span key={i}>↳</span>
                                                    ))}
                                                    {task.text}
                                                </>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`bulk-access-badge bulk-access-badge--${task.accessRole}`}
                                                id={accessDescriptionId}
                                                title={task.accessRole === 'owner'
                                                    ? 'You own this task'
                                                    : `Shared with you as ${task.accessRole}`}
                                            >
                                                {task.accessRole === 'viewer'
                                                    ? 'View only'
                                                    : task.accessRole.charAt(0).toUpperCase()
                                                        + task.accessRole.slice(1)}
                                            </span>
                                        </td>
                                        <td className="bulk_checkbox_cell">
                                            <input
                                                type="checkbox"
                                                checked={task.isArchived}
                                                onChange={e =>
                                                    updateLocal(task.id, "isArchived", e.target.checked)
                                                }
                                                disabled={!canEdit}
                                                aria-label={`${task.isArchived ? 'Unarchive' : 'Archive'} ${task.text}`}
                                                aria-describedby={!canEdit ? accessDescriptionId : undefined}
                                                title={!canEdit ? 'Owner or editor access required' : undefined}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="select-input"
                                                value={task.mode}
                                                onChange={e =>
                                                    updateLocal(task.id, "mode", e.target.value)
                                                }
                                                disabled={!canEdit}
                                                aria-label={`Mode for ${task.text}`}
                                                aria-describedby={!canEdit ? accessDescriptionId : undefined}
                                                title={!canEdit ? 'Owner or editor access required' : undefined}
                                            >
                                                {MODES.map(mode => (
                                                    <option key={mode} value={mode}>
                                                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="select-input"
                                                value={categoryValue}
                                                onChange={e => {
                                                    updateLocal(task.id, "category", e.target.value)
                                                }}
                                                disabled={!canEdit}
                                                aria-label={`Category for ${task.text}`}
                                                aria-describedby={!canEdit ? accessDescriptionId : undefined}
                                                title={!canEdit ? 'Owner or editor access required' : undefined}
                                            >
                                                {categoryOptions.map(({ value, label }) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <div className="bulk-edit-actions-cell">
                                            {task.hasSubChores && (
                                                <button className="page-btn" onClick={() => displaySubtasks(task)}>
                                                    {showSubtasksFor.has(task.id) ? "Hide Subtasks" : "View Subtasks"}
                                                </button>
                                            )}
                                            {canDeleteTask(task.accessRole) && (
                                                <button
                                                    className="page-btn"
                                                    onClick={() => handleDelete(task)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="bulk_footer">
                    <button
                        className="page-btn page-btn--primary"
                        onClick={handleSaveAll}
                        disabled={isSaving || !hasEditableChanges}
                    >
                        {isSaving ? 'Saving…' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {selectedItem && (
                <EditTaskForm
                    categories={categories}
                    enableSharing
                    canManageSharing={canManageTaskMembers(selectedItem.accessRole)}
                    formData={selectedItem}
                    onSave={async (item) => {
                        await updateItem(item);
                        setSelectedItem(null);
                    }}
                    onClose={() => setSelectedItem(null)}
                    onMembersChanged={loadTasks}
                />
            )}
        </Page>
    );
}

export default BulkEdit;
