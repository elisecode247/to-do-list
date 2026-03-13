import { useState, useEffect } from "react";
import type { ChecklistItem } from "app/types";
import EditTaskForm from 'src/edit-task-form/EditTaskForm';
import Page from "src/pages/Page";
import '../page.css';
import './bulk-edit.css';
import { MODES } from "src/checklist/constants";
import { categories } from "src/category-select/category-constants";
import { useToast } from "src/toast/use-toast";
import { useTask } from "src/app/use-task";

interface ChecklistItemWithDepth extends ChecklistItem {
    depth: number;
}

function BulkEdit() {
    const { showToast } = useToast();
    const { items, updateItem, deleteItem, bulkUpdate } = useTask();

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

    // Sync if tasks reload
    useEffect(() => {
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
                const updatedItem = item.id === id ? { ...item, [field]: value } : item;
                return updatedItem;
            });
        });
    };

    const handleSaveAll = async () => {
        setIsSaving(true);

        try {
            const changed = localItems.filter(local => {
                const original = items.find(i => i.id === local.id);
                if (!original) return false;

                return (
                    original.isArchived !== local.isArchived ||
                    original.mode !== local.mode ||
                    original.category !== local.category
                );
            });

            await bulkUpdate(changed);
            showToast("All changes saved successfully.", "success");
        } catch (err) {
            console.error(err);
            if (err instanceof Error && err.message) {
                showToast(`Failed to save changes: ${err.message}`, "error");
            } else {
                showToast("Failed to save changes.", "error");
            }
        } finally {
            setIsSaving(false);
        }
    };

    async function handleDelete(id: string) {
        try {
            const confirmed = confirm("Are you sure you want to delete this task? This action cannot be undone.");
            if (confirmed) {
                await deleteItem(id);
                showToast("Task deleted successfully.");
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to delete task. Please try again.");
        }
    }

    return (
        <Page title="Bulk Edit Tasks">
            <div className="bulk-edit-container">
                <p>Total {filteredTasks.length} Tasks</p>
                <div className="bulk-edit-table-container">
                    <table className="bulk_table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Task</th>
                                <th>Archived</th>
                                <th>Mode</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task, index) => {
                                const taskCategory = Object.keys(categories).includes(task.category) ? task.category : "";
                                return (
                                    <tr
                                        key={task.id}
                                        className="bulk-edit-task-row"
                                        data-depth={task.depth}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{task.id}</td>
                                        <td className="bulk_task_cell" onClick={() => setSelectedItem(task)}>
                                            {/** add loop of ↳ for each subtask depth */}
                                            {Array.from({ length: task.depth }).map((_, i) => (
                                                <span key={i}>↳</span>
                                            ))}
                                            {task.text}
                                        </td>
                                        <td className="bulk_checkbox_cell">
                                            <input
                                                type="checkbox"
                                                checked={task.isArchived}
                                                onChange={e =>
                                                    updateLocal(task.id, "isArchived", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="select-input"
                                                value={task.mode}
                                                onChange={e =>
                                                    updateLocal(task.id, "mode", e.target.value)
                                                }
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
                                                value={taskCategory}
                                                onChange={e => {
                                                    updateLocal(task.id, "category", e.target.value)
                                                }}
                                            >
                                                {Object.entries(categories).map(([value, name]) => (
                                                    <option key={value} value={value}>
                                                        {name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="bulk-edit-actions-cell">
                                            {task.hasSubChores && (
                                                <button onClick={() => displaySubtasks(task)}>
                                                    {showSubtasksFor.has(task.id) ? "Hide Subtasks" : "View Subtasks"}
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(task.id)}>Delete</button>
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
                        disabled={isSaving}
                    >
                        Save All Changes
                    </button>
                </div>
            </div>

            {selectedItem && (
                <EditTaskForm
                    formData={selectedItem}
                    setEditingItem={(item) => setSelectedItem(item)}
                    onSave={(item) => {
                        updateItem(item);
                        setSelectedItem(null);
                    }}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </Page>
    );
}

export default BulkEdit;
