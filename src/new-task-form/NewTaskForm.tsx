import { useState, useRef } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import { IntervalOptions, type IntervalRecurrence, type Mode } from 'app/types';
import './new-task-form.css';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { OCCASIONAL_MODE, ONE_TIME_MODE } from 'src/checklist/constants';
import { type ChecklistItem, FrequencyType } from 'app/types';

const NewTaskForm = () => {
    const { addItem } = useTask();
    const { showToast } = useToast();
    const [inputText, setInputText] = useState<string>("");
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);
    const [recurrenceCount, setRecurrenceCount] = useState<number>(1);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<FrequencyType>(FrequencyType.Daily);
    const [newTaskCategory, setNewTaskCategory] = useState<string>('');
    const isAddButtonDisabled = !inputText.length;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const noteRef = useRef<MDXEditorMethods | null>(null);

    const handleAddItem = async (): Promise<void> => {
        const text = inputText.trim();
        if (!text) return;
        let note = noteRef.current?.getMarkdown();
        let recurrence: IntervalRecurrence | null = null;
        if (mode === OCCASIONAL_MODE) {
            recurrence = {
                type: 'interval',
                count: recurrenceCount,
                frequency: recurrenceFrequency,
                startDate: new Date(),
            };
        }

        const newItem: ChecklistItem = {
            id: crypto.randomUUID(),
            text,
            done: false,
            lastCompleted: '',
            note: note ?? '',
            sortOrder: 0,
            tabSortOrder: {},
            category: newTaskCategory,
            categoryUuid: null,
            mode,
            isPriority: false,
            isArchived: false,
            isHidden: false,
            hasSubChores: false,
            parentUuid: null,
            recurrence,
            nextDue: null,
        };
        try {
            await addItem(newItem);
            showToast('Task added ✨', 'success');
            setInputText('');
            if (noteRef.current) {
                noteRef.current.setMarkdown('');
            }
        } catch (err) {
            showToast('Failed to add task. Please try again.', 'error');
        }
    };

    const handleModeClick = (val: Mode): void => {
        setMode(val);
    }

    return  (<>
        <div ref={panelRef} className="new-task-form-item-container">
            <div className="new-task-form-item-header">
                <span className="new-task-form-title">New Task</span>
            </div>
            <FrequencyButtonGroup
                mode={mode}
                onClick={(mode: Mode) => handleModeClick(mode)}
            />
            {mode === OCCASIONAL_MODE && (
                <div className="form-group item-recurrence-container item-recurrence-container--new-task">
                    <label className="edit-task-form_recurrence-label">Repeat Every</label>
                    <input id="edit-task-form_recurrence-count" type="number"
                        min={1}
                        value={recurrenceCount}
                        onChange={(e) => {
                            const count = parseInt(e.target.value);
                            if (isNaN(count) || count < 1) return;
                            setRecurrenceCount(count);
                        }}
                    />
                    <select
                        value={recurrenceFrequency}
                        onChange={(e) => {
                            setRecurrenceFrequency(e.target.value as FrequencyType);
                        }}
                    >
                        {IntervalOptions.map(option => (
                            <option key={option.key} value={option.key}>{option.title}(s)</option>
                        ))}
                    </select>
                </div>
            )}
            <CategorySelect
                id={'new-task-form'}
                selectedCategory={newTaskCategory}
                onChange={(category: string) => setNewTaskCategory(category)}
            />
            <div className="new-task-form-input-row">
                <input
                    id="new-task-form-text-input"
                    className="new-task-form-text-input"
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
                    className={`new-task-form-add-button
                            ${isAddButtonDisabled &&
                        'new-task-form-add-button--disabled'}`
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
