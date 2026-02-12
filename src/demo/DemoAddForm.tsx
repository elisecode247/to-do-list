import { useState, useEffect } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import type { ChecklistItem, Mode } from 'app/types';
import { useTask } from 'src/demo/use-demo-task';

const DemoNewTaskForm = () => {
    const { addItem } = useTask();
    const [isAddSectionExpanded, setIsAddSectionExpanded] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>("");
    const [mode, setMode] = useState<Mode>("one-time");
    const [newTaskCategory, setNewTaskCategory] = useState<string>('');
    const isAddButtonDisabled = !inputText.length;

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isAddSectionExpanded) {
                setIsAddSectionExpanded(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isAddSectionExpanded]);

    const handleAddItem = (): void => {
        const text = inputText.trim();
        if (!text) return;

        const newItem: ChecklistItem = {
            id: crypto.randomUUID(),
            text,
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            tabSortOrder: {},
            category: newTaskCategory,
            categoryUuid: null,
            mode,
            isPriority: false,
            isArchived: false,
            isHidden: false,
            hasSubChores: false,
            parentUuid: null
        };
        addItem(newItem);
        setInputText('');
    };

    const handleModeClick = (mode: Mode): void => {
        setMode(mode);
    }

    return (
        <div className={`checklist_new-item-container ${isAddSectionExpanded ? 'expanded' : 'collapsed'}`}>
            {!isAddSectionExpanded && (
                <button
                    className="checklist_new-item-toggle-button"
                    onClick={() => setIsAddSectionExpanded(true)}
                    aria-label="Add new item"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add New Item
                </button>
            )}
            {isAddSectionExpanded && (<>
                <div className="checklist_new-item-header">
                    <span className="checklist_new-item-title">New Task</span>
                    <button
                        className="checklist_new-item-close-button"
                        onClick={() => setIsAddSectionExpanded(false)}
                        aria-label="Close"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <FrequencyButtonGroup
                    mode={mode}
                    onClick={(mode: Mode) => handleModeClick(mode)}
                />
                <CategorySelect
                    id="checklist-new-item-category-select"
                    selectedCategory={newTaskCategory}
                    onChange={(category: string) => setNewTaskCategory(category)}
                />
                <div className="checklist_new-item-input-row">
                    <input
                        id="checklist-new-item-text-input"
                        className="checklist_new-item-text-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                handleAddItem();
                            }
                        }}
                        placeholder="New item..."
                    />
                    <button
                        disabled={isAddButtonDisabled}
                        className={`checklist_new-item-add-button
                            ${isAddButtonDisabled &&
                            'checklist_new-item-add-button--disabled'}`
                        }
                        onClick={handleAddItem}
                    >
                        Add
                    </button>
                </div>
            </>)}
        </div>
    )
}
export default DemoNewTaskForm;
