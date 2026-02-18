import { useState, useEffect, useRef } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import type { ChecklistItem } from 'app/types';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import { type Mode } from 'app/types';
import './new-task-form.css';
import { PlusCircle, X } from 'lucide-react'
import { ONE_TIME_MODE } from 'src/checklist/constants';

const NewTaskForm = () => {
    const { addItem } = useTask();
    const { showToast } = useToast();
    const [isAddSectionExpanded, setIsAddSectionExpanded] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>("");
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);
    const [newTaskCategory, setNewTaskCategory] = useState<string>('');
    const isAddButtonDisabled = !inputText.length;
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isAddSectionExpanded) {
                setIsAddSectionExpanded(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isAddSectionExpanded]);

    const handleAddItem = async (): Promise<void> => {
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
        try {
            await addItem(newItem);
            showToast('Task added ✨', 'success');
            setInputText('');
        } catch (err) {
            showToast('Failed to add task. Please try again.', 'error');
        }
    };

    const handleModeClick = (val: Mode): void => {
        setMode(val);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                panelRef?.current &&
                !panelRef?.current?.contains(event.target as Node)
            ) {
                setIsAddSectionExpanded(false);
            }
        }

        if (isAddSectionExpanded) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isAddSectionExpanded]);


    return  (<>
        <button
            className={`checklist_new-item-toggle-button
                ${isAddSectionExpanded ? 'checklist_new-item-toggle-button--collapsed' : ''}`}
            onClick={() => setIsAddSectionExpanded(true)}
            aria-label="Add new task"
        >
            <PlusCircle size={16} />
            Add New Item
        </button>
        <div ref={panelRef} className={
            `checklist_new-item-container
            checklist_new-item-container--${isAddSectionExpanded ?
                'expanded' : 'collapsed'}`}
        >
            <div className="checklist_new-item-header">
                <span className="checklist_new-item-title">New Task</span>
                <button
                    className="checklist_new-item-close-button"
                    onClick={() => setIsAddSectionExpanded(false)}
                    aria-label="Close"
                >
                    <X size={16} />
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
        </div >
    </>);
}
export default NewTaskForm;
