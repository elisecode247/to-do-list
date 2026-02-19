import { useMemo, useState } from "react";
import type { ChecklistItem } from "app/types";
import ItemModal from 'src/item-modal/ItemModal';
import Page from "src/pages/Page";
import '../page.css';
import './bulk-edit.css';
import { MODES } from "src/checklist/constants";
import { categories } from "src/category-select/category-constants";
import { useToast } from "src/toast/use-toast";
import { useTask } from "src/app/use-task";
import { Trash2 } from "lucide-react";

function BulkEdit() {
    const { showToast } = useToast();
    const { items, updateItem, deleteItem, bulkUpdate } = useTask();

    const [localItems, setLocalItems] = useState<ChecklistItem[]>(items);
    const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const filteredTasks = localItems.filter(item => !item.parentUuid);

    // Sync if tasks reload
    useMemo(() => {
        setLocalItems(items);
    }, [items]);

    const updateLocal = (
        id: string,
        field: keyof ChecklistItem,
        value: any
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
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task, index) => {
                                const taskCategory = Object.keys(categories).includes(task.category) ? task.category : "";
                                return (
                                    <tr key={task.id}>
                                        <td>{index + 1}</td>
                                        <td>{task.id}</td>
                                        <td className="bulk_task_cell" onClick={() => setSelectedItem(task)}>
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
                                        <td>
                                            <button onClick={() => handleDelete(task.id)}><Trash2 /></button>
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
                <ItemModal
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
