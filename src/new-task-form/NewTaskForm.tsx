import { useState, useRef } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import { INTERVAL_RECURRENCE_TYPE, IntervalOptions, ONE_TIME_RECURRENCE_TYPE, type CalendarRecurrence, type IntervalRecurrence, type Mode, type OneTimeRecurrence } from 'app/types';
import './new-task-form.css';
import 'src/task-form/task-form-shared.css';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { OCCASIONAL_MODE, ONE_TIME_MODE, CALENDAR_MODE, DAILY_MODE } from 'src/checklist/constants';
import { type ChecklistItem, FrequencyType } from 'app/types';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import CloseButton from 'components/close-button/CloseButton';
import RecurrenceForm from 'src/recurrence-form/RecurrenceForm';

const NewTaskForm = ({ isDesktop, setRightOpen }: { isDesktop: boolean; setRightOpen: (open: boolean) => void }) => {
    const { addItem } = useTask();
    const { showToast } = useToast();
    const [inputText, setInputText] = useState<string>("");
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);
    const [recurrenceCount, setRecurrenceCount] = useState<number>(1);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<FrequencyType>(FrequencyType.Daily);
    const [recurrenceStartDate, setRecurrenceStartDate] = useState<string>(formatDate(new Date()));
    const [calendarRecurrence, setCalendarRecurrence] = useState<CalendarRecurrence | null>(null);
    const [newTaskCategory, setNewTaskCategory] = useState<string>('');
    const isAddButtonDisabled = !inputText.length;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const noteRef = useRef<MDXEditorMethods | null>(null);

    const handleAddItem = async (): Promise<void> => {
        const text = inputText.trim();
        if (!text) return;
        const note = noteRef.current?.getMarkdown();
        let recurrence: OneTimeRecurrence | IntervalRecurrence | CalendarRecurrence | null = null;
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
        } else if (mode === CALENDAR_MODE) {
            recurrence = calendarRecurrence;
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
        <div ref={panelRef} className="task-form-drawer">
            <div className="task-form-drawer__header">
                <h2 className="task-form-drawer__title">New task</h2>
                {isDesktop && (
                    <CloseButton
                        onClick={() => setRightOpen(false)}
                        label="Close new task form"
                    />
                )}
            </div>

            <div className="task-form-drawer__body">
                <div className="task-form-field">
                    <label className="task-form-field__label" htmlFor="new-task-form-text-input">Task name</label>
                    <input
                        id="new-task-form-text-input"
                        className="task-form-input"
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
                </div>

                <div className="task-form-field">
                    <label className="task-form-field__label">Category</label>
                    <div className="task-form-category-wrap">
                        <CategorySelect
                            id={'new-task-form'}
                            selectedCategory={newTaskCategory}
                            onChange={(category: string) => setNewTaskCategory(category)}
                        />
                    </div>
                </div>

                <div className="task-form-field">
                    <div className="task-form-section-divider">Schedule</div>
                    <FrequencyButtonGroup
                        mode={mode}
                        onClick={(mode: Mode) => handleModeClick(mode)}
                    />
                </div>

                {mode !== CALENDAR_MODE && (
                    <>
                        {mode === OCCASIONAL_MODE && (
                            <div className="task-form-field">
                                <label
                                    className="task-form-field__label"
                                    htmlFor="new-task-form_recurrence-count"
                                >
                                    Repeat every
                                </label>
                                <div className="task-form-inline-row">
                                    <input
                                        id="new-task-form_recurrence-count"
                                        className="task-form-input task-form-recurrence-count"
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
                                        className="task-form-input task-form-select task-form-recurrence-frequency"
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
                            </div>
                        )}

                        <div className="task-form-field">
                            <label
                                className="task-form-field__label"
                                htmlFor="new-task-form_recurrence-start-date"
                            >
                                Starting
                            </label>
                            <input
                                id="new-task-form_recurrence-start-date"
                                className="task-form-input task-form-recurrence-start-date"
                                type="date"
                                value={recurrenceStartDate}
                                onFocus={(e) => e.currentTarget.showPicker?.()}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                onChange={(e) => {
                                    setRecurrenceStartDate(e.target.value);
                                }}
                            />
                        </div>
                    </>
                )}
                {mode === CALENDAR_MODE && (
                    <RecurrenceForm
                        value={calendarRecurrence}
                        startDate={new Date(localDateWithNowTime(recurrenceStartDate))}
                        onChange={setCalendarRecurrence}
                    />
                )}
            </div>

            <div className="task-form-drawer__footer">
                <button
                    className="task-form-action-button task-form-action-button--cancel"
                    onClick={() => setRightOpen(false)}
                    type="button"
                    aria-label="Close form"
                >
                    Cancel
                </button>
                <button
                    disabled={isAddButtonDisabled}
                    className="task-form-action-button task-form-action-button--save"
                    onClick={handleAddItem}
                    type="button"
                    aria-label="Add task"
                >
                    Add
                </button>
            </div>
        </div >
    </>);
}
export default NewTaskForm;
