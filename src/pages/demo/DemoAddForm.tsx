import { useState, useRef } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import { useDemoTask } from 'src/pages/demo/use-demo-task';
import { useToast } from 'src/toast/use-toast';
import { IntervalOptions, type IntervalRecurrence, type Mode, type OneTimeRecurrence } from 'app/types';
import 'src/new-task-form/new-task-form.css';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { OCCASIONAL_MODE, ONE_TIME_MODE, CALENDAR_MODE, DAILY_MODE } from 'src/checklist/constants';
import {
    type ChecklistItem,
    FrequencyType,
    ONE_TIME_RECURRENCE_TYPE,
    INTERVAL_RECURRENCE_TYPE,
 } from 'app/types';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';

const NewTaskForm = () => {
    const { addItem } = useDemoTask();
    const { showToast } = useToast();
    const [inputText, setInputText] = useState<string>("");
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);
    const [recurrenceCount, setRecurrenceCount] = useState<number>(1);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<FrequencyType>(FrequencyType.Daily);
    const [recurrenceStartDate, setRecurrenceStartDate] = useState<string>(formatDate(new Date()));
    const [newTaskCategory, setNewTaskCategory] = useState<string>('');
    const isAddButtonDisabled = !inputText.length;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const noteRef = useRef<MDXEditorMethods | null>(null);

    const handleAddItem = async (): Promise<void> => {
        const text = inputText.trim();
        if (!text) return;
        const note = noteRef.current?.getMarkdown();
        let recurrence: OneTimeRecurrence | IntervalRecurrence | null = null;
        if (mode === ONE_TIME_MODE) {
            recurrence = {
                type: ONE_TIME_RECURRENCE_TYPE,
                startDate: new Date(localDateWithNowTime(recurrenceStartDate)).toISOString(),
            } as OneTimeRecurrence;
        } else if (mode === DAILY_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE_TYPE,
                count: 1,
                frequency: FrequencyType.Daily,
                startDate: new Date(localDateWithNowTime(recurrenceStartDate)).toISOString(),
            } as IntervalRecurrence;
        } else if (mode === OCCASIONAL_MODE) {
            recurrence = {
                type: 'interval',
                count: recurrenceCount,
                frequency: recurrenceFrequency,
                startDate: new Date(localDateWithNowTime(recurrenceStartDate)).toISOString(),
            };
        }

        const newItem: ChecklistItem = {
            itemType: 'checklist-item',
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
            console.error('Error adding task:', err);
            showToast('Failed to add task. Please try again.', 'error');
        }
    };

    const handleModeClick = (val: Mode): void => {
        setMode(val);
    }

    return (<>
        <div ref={panelRef} className="new-task-form-item-container">
            <div className="new-task-form-item-header">
                <span className="new-task-form-title">New Task</span>
            </div>
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
            <FrequencyButtonGroup
                mode={mode}
                onClick={(mode: Mode) => handleModeClick(mode)}
            />
            {mode !== CALENDAR_MODE && (
                <div className="item-recurrence-container item-recurrence-container--new-task">
                    {mode === OCCASIONAL_MODE && (
                        <>
                            <div className="form-group">
                                <label
                                    className="new-task-form_recurrence-label"
                                    htmlFor="new-task-form_recurrence-count">
                                    Repeat Every
                                </label>
                                <input
                                    id="new-task-form_recurrence-count"
                                    className="new-task-form_recurrence-count"
                                    type="number"
                                    min={1}
                                    value={recurrenceCount}
                                    onChange={(e) => {
                                        const count = parseInt(e.target.value);
                                        if (isNaN(count) || count < 1) return;
                                        setRecurrenceCount(count);
                                    }}
                                />
                                <select
                                    className="select-input"
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
                        </>
                    )}
                    <div className="form-group">
                        <label
                            className="new-task-form_recurrence-label"
                            htmlFor="new-task-form_recurrence-start-date">
                            Starting
                        </label>
                        <input
                            id="new-task-form_recurrence-start-date"
                            className="new-task-form_recurrence-start-date"
                            type="date"
                            value={recurrenceStartDate}
                            onFocus={(e) => e.currentTarget.showPicker?.()}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            onChange={(e) => {
                                setRecurrenceStartDate(e.target.value);
                            }}
                        />
                    </div>
                </div>
            )}
            <CategorySelect
                id={'new-task-form'}
                selectedCategory={newTaskCategory}
                onChange={(category: string) => setNewTaskCategory(category)}
            />
        </div >
    </>);
}
export default NewTaskForm;
