import { useState, useRef, useEffect } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import './new-task-form.css';
import 'src/task-form/task-form-shared.css';
import { OCCASIONAL_MODE, ONE_TIME_MODE, DAILY_MODE } from 'src/checklist/constants';
import { type ChecklistItem, FrequencyType, type OneTimeRecurrence } from 'app/types';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import {
    IntervalOptions,
    INTERVAL_RECURRENCE,
    ONE_TIME_RECURRENCE,
    type Mode,
    type IntervalRecurrence
} from 'app/types';
import type { CategoryDefinition } from 'src/category-select/types';

type Inputs = {
    taskName: string;
    category: string;
    numberOfRepetitions: number;
    frequency: FrequencyType;
}

type RecurrenceFormValues = {
    startDate: string;
    endDate: string;
    numberOfRepetitions: number;
    isRepeating: boolean;
    frequency: FrequencyType;
};

type NewTaskFormValues = Inputs & RecurrenceFormValues;

const NewTaskForm = ({ setRightOpen, categories }: { setRightOpen: (open: boolean) => void, categories: CategoryDefinition[] }) => {
    const { addItem } = useTask();
    const { showToast } = useToast();
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);
    const panelRef = useRef<HTMLDivElement | null>(null);

    const defaultValues = {
        taskName: '',
        category: '',
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        isRepeating: false,
        numberOfRepetitions: 1,
        frequency: FrequencyType.Daily,
    }
    const methods = useForm<NewTaskFormValues>({ defaultValues });
    const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = methods;
    const handleAddItem: SubmitHandler<NewTaskFormValues> = async (data): Promise<void> => {
        let recurrence: OneTimeRecurrence | IntervalRecurrence;
        if (mode === ONE_TIME_MODE) {
            recurrence = {
                type: ONE_TIME_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
            }
        } else if (mode === DAILY_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
                frequency: FrequencyType.Daily,
                numberOfRepetitions: 1,
            }
        } else if (mode === OCCASIONAL_MODE) {
            recurrence = {
                type: INTERVAL_RECURRENCE,
                startDate: new Date(localDateWithNowTime(data.startDate)).toISOString(),
                frequency: data.frequency,
                numberOfRepetitions: data.numberOfRepetitions,
            }
        } else {
            showToast('Invalid recurrence mode selected.', 'error');
            return;
        }

        const newItem: ChecklistItem = {
            isOwner: true,
            hasMembers: false,
            accessRole: 'owner',
            itemType: 'checklist-item',
            id: crypto.randomUUID(),
            text: '',
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            tabSortOrder: {},
            category: '',
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
            await addItem({ ...newItem, ...data, text: data.taskName });
            showToast('Task added ✨', 'success');
            setRightOpen(false);
        } catch (err) {
            console.error('Error adding task:', err);
            showToast('Failed to add task. Please try again.', 'error');
        }
    };

    const handleModeClick = (val: Mode): void => {
        setMode(val);
    }

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset({
                taskName: '',
                category: '',
                startDate: formatDate(new Date()),
                endDate: formatDate(new Date()),
                isRepeating: false,
                numberOfRepetitions: 1,
                frequency: FrequencyType.Daily,
            });
        }
    }, [isSubmitSuccessful, reset]);

    return (<div ref={panelRef}>
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleAddItem)}>
                <div className="task-form-drawer__body">
                    <div className="task-form-field">
                        <label className="task-form-field__label" htmlFor="new-task-form-text-input">Task name</label>
                        <input
                            {...register("taskName", { required: true })}
                            name="taskName"
                            id="new-task-form-text-input"
                            className="task-form-input"
                            placeholder="New item..."
                        />
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-field__label">Category</label>
                        <div className="task-form-category-wrap">
                            <CategorySelect id="new-task-form" categories={categories} />
                        </div>
                    </div>

                    <div className="task-form-field">
                        <div className="task-form-section-divider">Schedule</div>
                        <FrequencyButtonGroup
                            mode={mode}
                            onClick={(mode: Mode) => handleModeClick(mode)}
                        />
                    </div>

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
                                        min={1}
                                        {...register("numberOfRepetitions", { valueAsNumber: true, min: 1 })}
                                        id="new-task-form_recurrence-count"
                                        className="task-form-input task-form-recurrence-count"
                                        type="number"
                                    />
                                    <select
                                        {...register("frequency")}
                                        name="frequency"
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
                            <label
                                className="task-form-field__label"
                                htmlFor="new-task-form_recurrence-start-date"
                            >
                                Starting
                            </label>
                            <input
                                {...register("startDate")}
                                name="startDate"
                                id="new-task-form_recurrence-start-date"
                                className="task-form-input task-form-recurrence-start-date"
                                type="date"
                                onFocus={(e) => e.currentTarget.showPicker?.()}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>
                </div>

                <div className="task-form-drawer__footer">
                    {errors.taskName && (
                        <div className="task-form-drawer__error">
                            Error: {errors.taskName.message || 'task name is required'}
                        </div>
                    )}
                    {errors.category && (
                        <div className="task-form-drawer__error">
                            Error: {errors.category.message || 'category is required'}
                        </div>
                    )}
                    {errors.startDate && (
                        <div className="task-form-drawer__error">
                            Error: {errors.startDate.message || 'start date is required'}
                        </div>
                    )}
                    {errors.endDate && (
                        <div className="task-form-drawer__error">
                            Error: {errors.endDate.message || 'end date is invalid'}
                        </div>
                    )}
                    <button
                        className="task-form-action-button task-form-action-button--cancel"
                        onClick={() => setRightOpen(false)}
                        type="button"
                        aria-label="Close form"
                    >
                        Cancel
                    </button>
                    <button
                        className="task-form-action-button task-form-action-button--save"
                        type="submit"
                        aria-label="Add task"
                    >
                        Add
                    </button>
                </div>
            </form>
        </FormProvider>
    </div>);
}
export default NewTaskForm;
