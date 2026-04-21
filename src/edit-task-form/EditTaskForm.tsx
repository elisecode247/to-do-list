import 'src/edit-task-form/edit-task-form.css';
import 'src/task-form/task-form-shared.css';
import { useRef, type FC } from 'react';
import type { CalendarRecurrence, ChecklistItem, IntervalRecurrence, Mode, OneTimeRecurrence } from 'app/types';
import { MODES, OCCASIONAL_MODE, CALENDAR_MODE, ONE_TIME_MODE, DAILY_MODE } from 'checklist/constants';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import CategorySelect from 'category-select/CategorySelect';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { CALENDAR_RECURRENCE_TYPE, FrequencyType, INTERVAL_RECURRENCE_TYPE, IntervalOptions, ONE_TIME_RECURRENCE_TYPE } from 'src/app/types';
import { getRecurrenceCount } from 'src/app/utilities/get-recurrence-count';
import CloseButton from 'components/close-button/CloseButton';
import RecurrenceForm from 'src/recurrence-form/RecurrenceForm';

type EditTaskFormProps = {
    isSaving?: boolean;
    formData: ChecklistItem;
    setEditingItem: (item: ChecklistItem) => void;
    onSave: (item: ChecklistItem) => void;
    onClose: () => void;
};

export const EditTaskForm: FC<EditTaskFormProps> = ({
    isSaving = false,
    formData,
    setEditingItem,
    onSave,
    onClose,
}) => {
    const recurrenceStartDate = formData?.recurrence?.startDate
        ? formatDate(new Date(formData.recurrence.startDate))
        : formatDate(new Date());
    const noteRef = useRef<MDXEditorMethods>(null)
    const handleSave = async () => {
        const note = noteRef.current?.getMarkdown();
        let recurrence = formData.recurrence;
        if (formData.mode === OCCASIONAL_MODE) {
            recurrence = {
                type: 'interval',
                count: getRecurrenceCount(formData.recurrence, 1),
                frequency: (formData.recurrence as IntervalRecurrence)?.frequency ?? FrequencyType.Daily,
                startDate: (formData.recurrence as IntervalRecurrence)?.startDate ?? new Date().toISOString(),
            } as IntervalRecurrence;
        }
        if (formData.mode === ONE_TIME_MODE) {
            recurrence = {
                type: ONE_TIME_RECURRENCE_TYPE,
                startDate: formData.recurrence?.startDate ?? new Date().toISOString(),
            } as OneTimeRecurrence;
        }
        onSave({
            ...formData,
            note: note ?? formData.note ?? '',
            recurrence: recurrence ?? formData.recurrence,
        });
        onClose();
    }

    const toggleMode = (mode: Mode) => {
        setEditingItem({
            ...formData,
            mode: mode
        });
    };

    const modeLabel = (mode: string) =>
        mode === 'one-time'
            ? 'One-time'
            : mode.charAt(0).toUpperCase() + mode.slice(1);

    const togglePriority = () => {
        setEditingItem({
            ...formData,
            isPriority: !formData.isPriority
        });
    }

    const handleRecurrenceStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) {
            // Allow clearing the date
            setEditingItem({
                ...formData,
                recurrence: null
            });
            return;
        }

        const isoDateString = new Date(localDateWithNowTime(e.target.value)).toISOString();
        let recurrence = formData.recurrence;
        if (formData.mode === ONE_TIME_MODE) {
            recurrence = {
                type: ONE_TIME_RECURRENCE_TYPE,
                startDate: isoDateString
            }
        } else if (formData.mode === DAILY_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE_TYPE,
                count: 1,
                frequency: FrequencyType.Daily,
                startDate: isoDateString,
            }
        } else if (formData.mode === OCCASIONAL_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE_TYPE,
                count: getRecurrenceCount(formData.recurrence, 1),
                frequency: (formData.recurrence as IntervalRecurrence)?.frequency ?? FrequencyType.Daily,
                startDate: isoDateString,
            }
        } else if (formData.mode === CALENDAR_MODE) {
            recurrence = {
                ...formData.recurrence,
                type: CALENDAR_RECURRENCE_TYPE,
                startDate: new Date(isoDateString),
            } as CalendarRecurrence;
        }
        setEditingItem({
            ...formData,
            recurrence
        })
    }

    return (
        <div className="task-form-drawer edit-item-container">
            <div className="task-form-drawer__header">
                <h2 className="task-form-drawer__title">Edit task</h2>
                <CloseButton
                    onClick={onClose}
                    label="Close edit task form"
                />
            </div>

            <div className="task-form-drawer__body">
                <div className="task-form-field">
                    <label className="task-form-field__label">Task name</label>
                    <input
                        className="task-form-input"
                        type="text"
                        value={formData.text}
                        onChange={(e) =>
                            setEditingItem({ ...formData, text: e.target.value })
                        }
                        placeholder="Task name"
                    />
                </div>

                <div className="task-form-field">
                    <label className="task-form-field__label">Category</label>
                    <div className="task-form-category-wrap">
                        <CategorySelect
                            id={formData.id}
                            isFilter={false}
                            selectedCategory={formData.category}
                            onChange={(category: string) =>
                                setEditingItem({ ...formData, category })
                            }
                        />
                    </div>
                </div>

                <div className="task-form-field">
                    <div className="task-form-section-divider">Schedule</div>
                    <div className="edit-task-chip-row">
                        {MODES.map(mode => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => toggleMode(mode)}
                                className={`edit-task-chip ${formData.mode === mode ? 'edit-task-chip--active' : ''}`}
                            >
                                {modeLabel(mode)}
                            </button>
                        ))}
                    </div>
                </div>

                {formData.mode !== CALENDAR_MODE && (
                    <>
                        {formData.mode === OCCASIONAL_MODE && (
                            <div className="task-form-field">
                                <label
                                    htmlFor={`edit-task-form_recurrence-count-${formData.id}`}
                                    className="task-form-field__label"
                                >
                                    Repeat every
                                </label>
                                <div className="task-form-inline-row">
                                    <input
                                        id={`edit-task-form_recurrence-count-${formData.id}`}
                                        className="task-form-input task-form-recurrence-count"
                                        type="number"
                                        min={1}
                                        max={1000}
                                        value={getRecurrenceCount(formData.recurrence)}
                                        onChange={(e) => {
                                            const count = parseInt(e.target.value);
                                            if (isNaN(count) || count < 1) return;

                                            setEditingItem({
                                                ...formData,
                                                recurrence: {
                                                    type: 'interval',
                                                    count,
                                                    frequency: (formData.recurrence as IntervalRecurrence)?.frequency ?? FrequencyType.Daily,
                                                    startDate: (formData.recurrence as IntervalRecurrence)?.startDate ?? new Date().toISOString(),
                                                },
                                            });
                                        }}
                                    />

                                    <select
                                        className="task-form-input task-form-select task-form-recurrence-frequency"
                                        value={(formData?.recurrence?.type === 'interval' ? formData.recurrence.frequency : FrequencyType.Daily)}
                                        onChange={(e) => {
                                            const frequency = e.target.value as IntervalRecurrence['frequency'];
                                            setEditingItem({
                                                ...formData,
                                                recurrence: {
                                                    ...formData.recurrence,
                                                    frequency
                                                } as IntervalRecurrence
                                            })
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
                            <label className="task-form-field__label">
                                Starting
                            </label>
                            <input
                                className="task-form-input task-form-recurrence-start-date"
                                type="date"
                                value={recurrenceStartDate}
                                onClick={(e) => e?.currentTarget.showPicker?.()}
                                onChange={handleRecurrenceStartDateChange}
                            />
                        </div>
                    </>
                )}

                {formData.mode === CALENDAR_MODE && (
                    <RecurrenceForm
                        value={formData.recurrence?.type === CALENDAR_RECURRENCE_TYPE
                            ? formData.recurrence as CalendarRecurrence
                            : null}
                        startDate={formData.recurrence?.startDate}
                        onChange={(propName, value) => {
                            const updatedRecurrence = {
                                ...formData.recurrence,
                                type: CALENDAR_RECURRENCE_TYPE,
                                [propName]: value
                            } as CalendarRecurrence;
                            setEditingItem({
                                    ...formData,
                                    recurrence: updatedRecurrence
                            });
                        }}
                    />
                )}

                <div className="task-form-field">
                    <label className="task-form-field__label">Last completed</label>
                    <input
                        className="task-form-input"
                        type="date"
                        value={formData.lastCompleted ? formatDate(new Date(formData.lastCompleted)) : ''}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setEditingItem({
                                    ...formData,
                                    lastCompleted: '',
                                });
                                return;
                            }
                            const isoDateString = new Date(localDateWithNowTime(e.target.value)).toISOString();
                            setEditingItem({
                                ...formData,
                                lastCompleted: isoDateString || '',
                            })
                        }}
                    />
                </div>

                <div className="task-form-field">
                    <div className="task-form-section-divider">Options</div>
                    <button
                        type="button"
                        onClick={() => togglePriority()}
                        className={`edit-task-priority ${formData.isPriority ? 'edit-task-priority--active' : ''}`}
                        title="Prioritize this task"
                    >
                        <span className="edit-task-priority_icon">{formData.isPriority ? '★' : '☆'}</span>
                        Priority
                    </button>
                </div>

                <div className="task-form-field">
                    <label className="task-form-field__label">Notes</label>
                    <div className="edit-task-notes-wrap">
                        <NoteEditor
                            ref={noteRef}
                            initialMarkdown={formData.note ?? ''}
                            readOnly={false}
                        />
                    </div>
                </div>
            </div>

            <div className="task-form-drawer__footer">
                <button
                    className="task-form-action-button task-form-action-button--cancel"
                    onClick={onClose}
                    type="button"
                    aria-label="Close form"
                >
                    Cancel
                </button>
                <button
                    disabled={isSaving}
                    className="task-form-action-button task-form-action-button--save"
                    onClick={handleSave}
                    type="button"
                    aria-label="Save changes"
                >
                    {isSaving ? <span>Saving...</span> : <span>Save</span>}
                </button>
            </div>
        </div>
    );
};

export default EditTaskForm;
