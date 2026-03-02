import 'src/edit-task-form/edit-task-form.css';
import { useRef, type FC } from 'react';
import type { ChecklistItem, IntervalRecurrence, Mode } from 'app/types';
import { MODES, OCCASIONAL_MODE, CALENDAR_MODE } from 'checklist/constants';
import { getModeColor } from 'src/checklist/utilities/get-mode-color';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import CategorySelect from 'category-select/CategorySelect';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { FrequencyType, IntervalOptions } from 'src/app/types';
import { getRecurrenceCount } from 'src/app/utilities/get-recurrence-count';

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

    const togglePriority = () => {
        setEditingItem({
            ...formData,
            isPriority: !formData.isPriority
        });
    }

    return (
        <div className="edit-item-container">
            <h2>Edit Task</h2>

            {/* Task */}
            <div className="form-group">
                <label>Task</label>
                <input
                    className="edit-task-form_text-input"
                    type="text"
                    value={formData.text}
                    onChange={(e) =>
                        setEditingItem({ ...formData, text: e.target.value })
                    }
                />
            </div>
            {/* Category */}
            <CategorySelect
                id={formData.id}
                isFilter={false}
                selectedCategory={formData.category}
                onChange={(category: string) =>
                    setEditingItem({ ...formData, category })
                }
            />
            {/* Date */}
            <div className="form-group">
                <label>Last Completed</label>
                <input
                    type="date"
                    value={formatDate(new Date(formData.lastCompleted)) ?? ''}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onFocus={(e) => e.currentTarget.showPicker?.()}
                    onChange={(e) => {
                        const isoDateString = new Date(localDateWithNowTime(e.target.value)).toISOString();
                        setEditingItem({
                            ...formData,
                            lastCompleted: isoDateString || '',
                        })
                    }}
                />
            </div>

            {/* Notes */}
            <div className="form-group">
                <label>Notes</label>
                <NoteEditor
                    ref={noteRef}
                    initialMarkdown={formData.note ?? ''}
                    readOnly={false}
                />
            </div>

            <div className="edit-task-form_mode-container">
                <p className="edit-task-form_mode-label">Schedule (choose one)</p>

                <div className="edit-task-form_mode-group">
                    {MODES.map(mode => (
                        <button
                            key={mode}
                            onClick={() => toggleMode(mode)}
                            className={`edit-task-form_mode-button
                                    ${formData.mode === mode ?
                                    getModeColor(mode) :
                                    'edit-task-form_mode-button--inactive'
                                }
                                `}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </div>
            {formData.mode !== CALENDAR_MODE && (
                <div className="item-recurrence-container">
                    {formData.mode === OCCASIONAL_MODE && (
                        <>
                            <div className="form-group">
                                <label
                                    htmlFor={`edit-task-form_recurrence-count-${formData.id}`}
                                    className="edit-task-form_recurrence-label"
                                >
                                    Repeat Every
                                </label>
                                <input
                                    id={`edit-task-form_recurrence-count-${formData.id}`}
                                    className="edit-task-form_recurrence-count"
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
                                                startDate: (formData.recurrence as IntervalRecurrence)?.startDate ?? new Date(),
                                            },
                                        });
                                    }}
                                />

                                <select
                                    className="select-input edit-task-form_recurrence-frequency"
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
                        </>
                    )}
                    <div className="form-group">
                        <label className="edit-task-form_recurrence-label">
                            Starting
                        </label>
                        <input
                            className="edit-task-form_recurrence-start-date"
                            type="date"
                            value={formData.recurrence?.type === 'interval' && formData.recurrence.startDate
                                ? formatDate(new Date(formData.recurrence.startDate))
                                : formatDate(new Date())}
                            onFocus={(e) => e.currentTarget.showPicker?.()}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            onChange={(e) => {
                                const isoDateString = new Date(localDateWithNowTime(e.target.value)).toISOString();
                                setEditingItem({
                                    ...formData,
                                    recurrence: {
                                        ...(formData.recurrence as IntervalRecurrence),
                                        startDate: isoDateString ?? '',
                                    } as IntervalRecurrence
                                })
                            }}
                        />
                    </div>
                </div>
            )}
            <div>

                <p className="edit-task-form_mode-label">Options</p>

                <div className="edit-task-form_mode-group">
                    <button
                        key="priority"
                        onClick={() => togglePriority()}
                        className={`edit-task-form_mode-button
                                edit-task-form_mode-button--priority
                                ${formData.isPriority
                                ? 'edit-task-form_mode-button--priority-active'
                                : ''}
                            `}
                        title="prioritize this task"
                    >
                        ⭐ Priority
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="edit-task-form_actions">
                <button
                    className="edit-task-form_action-button btn-secondary"
                    onClick={onClose}
                    type="button"
                    aria-label="Close form"
                >
                    Cancel
                </button>
                <button
                    disabled={isSaving}
                    className="edit-task-form_action-button btn-primary"
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
