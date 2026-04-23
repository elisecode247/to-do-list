import 'src/edit-task-form/edit-task-form.css';
import 'src/task-form/task-form-shared.css';
import { useState, useRef, type FC } from 'react';
import type { ChecklistItem, Mode, MonthlyPattern } from 'app/types';
import { MODES, OCCASIONAL_MODE, CALENDAR_MODE, ONE_TIME_MODE, DAILY_MODE } from 'checklist/constants';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import CategorySelect from 'category-select/CategorySelect';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import {
    CALENDAR_RECURRENCE,
    EndingConditionType,
    FrequencyType,
    INTERVAL_RECURRENCE,
    IntervalOptions,
    ONE_TIME_RECURRENCE,
    type CalendarRecurrence,
    type IntervalRecurrence,
    type OneTimeRecurrence,
} from 'src/app/types';
import CloseButton from 'components/close-button/CloseButton';
import RecurrenceForm from 'src/recurrence-form/RecurrenceForm';
import { useForm, FormProvider, type SubmitHandler, Controller, useWatch } from 'react-hook-form';

type EditTaskFormProps = {
    isSaving?: boolean;
    formData: ChecklistItem;
    onSave: (item: ChecklistItem) => void;
    onClose: () => void;
};

type RecurrenceFormValues = {
    startDate: string;
    numberOfRepetitions: number;
    isRepeating: boolean;
    frequency: FrequencyType;
    weekDaysRepetition: string[];
    monthlyPattern: MonthlyPattern;
    endingCondition: EndingConditionType;
    endingOccurrencesNumber: number;
    endDate: string;
};

type EditTaskFormValues = {
    taskName: string;
    category: string;
    lastCompleted: string;
    note: string;
} & RecurrenceFormValues;

export const EditTaskForm: FC<EditTaskFormProps> = ({
    isSaving = false,
    formData,
    onSave,
    onClose,
}) => {
    const [mode, setMode] = useState<Mode>(formData.mode);
    console.log("%c Line:101 🍫 formData", "color:#42b983", formData);
    const [isPriority, setIsPriority] = useState(formData.isPriority);
    const noteRef = useRef<MDXEditorMethods>(null);
    const recurrence = formData.recurrence;
    const isCalendarRecurrence = recurrence?.type === CALENDAR_RECURRENCE;
    const isIntervalRecurrence = recurrence?.type === INTERVAL_RECURRENCE;
    const isOneTimeRecurrence = recurrence?.type === ONE_TIME_RECURRENCE;

    const defaultValues: EditTaskFormValues = {
        taskName: formData.text,
        category: formData.category,
        lastCompleted: formData.lastCompleted ? formatDate(new Date(formData.lastCompleted)) : '',
        note: formData.note ?? '',
        startDate: recurrence?.startDate ? formatDate(new Date(recurrence.startDate)) : formatDate(new Date()),
        numberOfRepetitions: isIntervalRecurrence
            ? (recurrence as IntervalRecurrence).numberOfRepetitions ?? 1
            : isCalendarRecurrence
                ? (recurrence as CalendarRecurrence).numberOfRepetitions ?? 1
            : 1,
        isRepeating: isOneTimeRecurrence
            ? false
            : isIntervalRecurrence || (isCalendarRecurrence && (recurrence as CalendarRecurrence).frequency !== FrequencyType.None),
        frequency: isIntervalRecurrence
            ? (recurrence as IntervalRecurrence).frequency
            : isCalendarRecurrence
                ? (recurrence as CalendarRecurrence).frequency ?? FrequencyType.Weekly
                : FrequencyType.Weekly,
        weekDaysRepetition: isCalendarRecurrence
            ? ((recurrence as CalendarRecurrence).weekDaysRepetition ?? []).map(String)
            : [],
        monthlyPattern: isCalendarRecurrence
            ? (recurrence as CalendarRecurrence).monthlyPattern ?? 'day-of-month'
            : 'day-of-month',
        endingCondition: isCalendarRecurrence
            ? (recurrence as CalendarRecurrence).endingCondition ?? EndingConditionType.None
            : EndingConditionType.None,
        endingOccurrencesNumber: isCalendarRecurrence
            ? (recurrence as CalendarRecurrence).endingOccurrencesNumber ?? 10
            : 10,
        endDate: isCalendarRecurrence
            ? ((recurrence as CalendarRecurrence).endDate ? formatDate(new Date((recurrence as CalendarRecurrence).endDate as string)) : '')
            : '',
    };

    const methods = useForm<EditTaskFormValues>({ defaultValues });
    const { register, handleSubmit, control, formState: { errors } } = methods;
    const watchNote = useWatch({ control, name: 'note' });
    const handleSaveItem: SubmitHandler<EditTaskFormValues> = async (data) => {
        let recurrence: OneTimeRecurrence | IntervalRecurrence | CalendarRecurrence | null = null;
        if (mode === ONE_TIME_MODE) {
            recurrence = {
                type: ONE_TIME_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
            };
        } else if (mode === DAILY_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
                frequency: FrequencyType.Daily,
                numberOfRepetitions: 1,
            };
        } else if (mode === OCCASIONAL_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
                frequency: data.frequency,
                numberOfRepetitions: data.numberOfRepetitions,
            };
        } else if (mode === CALENDAR_MODE) {
            recurrence = {
                type: CALENDAR_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
                ...(data.isRepeating ? { numberOfRepetitions: data.numberOfRepetitions } : undefined),
                ...(data.isRepeating ? { frequency: data.frequency } : undefined),
                ...(data.isRepeating && data.frequency === FrequencyType.Weekly ?
                    { weekDaysRepetition: data.weekDaysRepetition } : undefined),
                ...(data.isRepeating && data.frequency === FrequencyType.Monthly ?
                    { monthlyPattern: data.monthlyPattern } : undefined),
                endingCondition: data.endingCondition,
                ...(data.endingCondition === EndingConditionType.OccurrencesNumber ?
                    { endingOccurrencesNumber: data.endingOccurrencesNumber } : undefined),
                ...(data.endingCondition === EndingConditionType.EndDate && data.endDate ?
                    { endDate: new Date(localDateWithNowTime(data.endDate)).toISOString() } : undefined),
                isAllDay: (formData.recurrence as CalendarRecurrence)?.isAllDay ?? true,
            };
        }

        onSave({
            ...formData,
            text: data.taskName,
            category: data.category,
            isPriority,
            mode,
            note: watchNote,
            lastCompleted: data.lastCompleted
                ? new Date(localDateWithNowTime(data.lastCompleted)).toISOString()
                : '',
            recurrence,
        });
        onClose();
    };

    const modeLabel = (m: string) =>
        m === 'one-time' ? 'One-time' : m.charAt(0).toUpperCase() + m.slice(1);

    return (
        <FormProvider {...methods}>
            <form
                className="task-form-drawer edit-item-container"
                onSubmit={handleSubmit(handleSaveItem)}
            >
                <div className="task-form-drawer__header">
                    <h2 className="task-form-drawer__title">Edit task</h2>
                    <CloseButton onClick={onClose} label="Close edit task form" />
                </div>

                <div className="task-form-drawer__body">
                    <div className="task-form-field">
                        <label className="task-form-field__label" htmlFor="edit-task-form-name">Task name</label>
                        <input
                            {...register('taskName', { required: true })}
                            id="edit-task-form-name"
                            className="task-form-input"
                            type="text"
                            placeholder="Task name"
                        />
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-field__label">Category</label>
                        <div className="task-form-category-wrap">
                            <CategorySelect id={formData.id} />
                        </div>
                    </div>

                    <div className="task-form-field">
                        <div className="task-form-section-divider">Schedule</div>
                        <div className="edit-task-chip-row">
                            {MODES.map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMode(m)}
                                    className={`edit-task-chip ${mode === m ? 'edit-task-chip--active' : ''}`}
                                >
                                    {modeLabel(m)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {mode !== CALENDAR_MODE && (
                        <>
                            {mode === OCCASIONAL_MODE && (
                                <div className="task-form-field">
                                    <label
                                        htmlFor={`edit-task-form_recurrence-count-${formData.id}`}
                                        className="task-form-field__label"
                                    >
                                        Repeat every
                                    </label>
                                    <div className="task-form-inline-row">
                                        <input
                                            {...register('numberOfRepetitions', { valueAsNumber: true, min: 1 })}
                                            id={`edit-task-form_recurrence-count-${formData.id}`}
                                            className="task-form-input task-form-recurrence-count"
                                            type="number"
                                            min={1}
                                            max={1000}
                                        />
                                        <select
                                            {...register('frequency')}
                                            className="task-form-input task-form-select task-form-recurrence-frequency"
                                        >
                                            {IntervalOptions.map(option => (
                                                <option key={option.key} value={option.key}>{option.title}(s)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="task-form-field">
                                <label className="task-form-field__label">Starting</label>
                                <input
                                    {...register('startDate')}
                                    className="task-form-input task-form-recurrence-start-date"
                                    type="date"
                                    onClick={(e) => e.currentTarget.showPicker?.()}
                                />
                            </div>
                        </>
                    )}

                    {mode === CALENDAR_MODE && (
                        <RecurrenceForm />
                    )}

                    <div className="task-form-field">
                        <label className="task-form-field__label">Last completed</label>
                        <input
                            {...register('lastCompleted')}
                            className="task-form-input"
                            type="date"
                            onClick={(e) => e.currentTarget.showPicker?.()}
                        />
                    </div>

                    <div className="task-form-field">
                        <div className="task-form-section-divider">Options</div>
                        <button
                            type="button"
                            onClick={() => setIsPriority(p => !p)}
                            className={`edit-task-priority ${isPriority ? 'edit-task-priority--active' : ''}`}
                            title="Prioritize this task"
                        >
                            <span className="edit-task-priority_icon">{isPriority ? '★' : '☆'}</span>
                            Priority
                        </button>
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-field__label">Notes</label>
                        <div className="edit-task-notes-wrap">
                            <Controller
                                name="note"
                                control={control}
                                render={({ field }) => (
                                    <NoteEditor
                                        ref={noteRef}
                                        initialMarkdown={field.value}
                                        onChange={field.onChange}
                                        readOnly={false}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="task-form-drawer__footer">
                    {errors.taskName && (
                        <div className="task-form-drawer__error">
                            {errors.taskName.message || 'Task name is required'}
                        </div>
                    )}
                    {errors.startDate && (
                        <div className="task-form-drawer__error">
                            {errors.startDate.message || 'Start date is required'}
                        </div>
                    )}
                    {errors.endDate && (
                        <div className="task-form-drawer__error">
                            {errors.endDate.message || 'End date is invalid'}
                        </div>
                    )}
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
                        type="submit"
                        aria-label="Save changes"
                    >
                        {isSaving ? <span>Saving...</span> : <span>Save</span>}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
};

export default EditTaskForm;
