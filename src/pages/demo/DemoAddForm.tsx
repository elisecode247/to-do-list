import { useState, useEffect, useRef } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import { useDemoTask } from 'src/pages/demo/use-demo-task';
import { useToast } from 'src/toast/use-toast';
import { IntervalOptions, type Mode, type OneTimeRecurrence } from 'app/types';
import 'src/new-task-form/new-task-form.css';
import { OCCASIONAL_MODE, ONE_TIME_MODE, DAILY_MODE } from 'src/checklist/constants';
import {
    type ChecklistItem,
    FrequencyType,
    ONE_TIME_RECURRENCE,
    INTERVAL_RECURRENCE,
    type IntervalRecurrence,
} from 'app/types';
import { formatDate } from 'src/app/utilities/format-date';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';

type RecurrenceFormValues = {
    startDate: string;
    numberOfRepetitions: number;
    isRepeating: boolean;
    frequency: FrequencyType;
    endDate: string;
};

type DemoAddFormValues = {
    taskName: string;
    category: string;
} & RecurrenceFormValues;

const DemoAddForm = () => {
    const { addItem } = useDemoTask();
    const { showToast } = useToast();
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);
    const panelRef = useRef<HTMLDivElement | null>(null);

    const defaultValues: DemoAddFormValues = {
        taskName: '',
        category: '',
        startDate: formatDate(new Date()),
        isRepeating: false,
        numberOfRepetitions: 1,
        frequency: FrequencyType.Weekly,
        endDate: formatDate(new Date()),
    };

    const methods = useForm<DemoAddFormValues>({ defaultValues });
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitSuccessful } } = methods;

    const taskName = watch('taskName');
    const isAddButtonDisabled = !taskName?.trim().length;

    const handleAddItem: SubmitHandler<DemoAddFormValues> = async (data): Promise<void> => {
        let recurrence: OneTimeRecurrence | IntervalRecurrence;
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
        } else {
            showToast('Invalid recurrence mode selected.', 'error');
            return;
        }

        const newItem: ChecklistItem = {
            itemType: 'checklist-item',
            id: crypto.randomUUID(),
            text: data.taskName,
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            tabSortOrder: {},
            category: data.category,
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
        } catch (err) {
            console.error('Error adding task:', err);
            showToast('Failed to add task. Please try again.', 'error');
        }
    };

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset({
                ...defaultValues,
                startDate: formatDate(new Date()),
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitSuccessful, reset]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleAddItem)}>
                <div ref={panelRef} className="new-task-form-item-container">
                    <div className="new-task-form-item-header">
                        <span className="new-task-form-title">New Task</span>
                    </div>
                    <div className="new-task-form-input-row">
                        <input
                            {...register('taskName', { required: true })}
                            id="new-task-form-text-input"
                            className="new-task-form-text-input"
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    handleSubmit(handleAddItem)();
                                }
                            }}
                            placeholder="New item..."
                        />
                        <button
                            type="submit"
                            disabled={isAddButtonDisabled}
                            className={`new-task-form-add-button${isAddButtonDisabled ? ' new-task-form-add-button--disabled' : ''}`}
                        >
                            Add
                        </button>
                    </div>
                    <FrequencyButtonGroup
                        mode={mode}
                        onClick={(val: Mode) => setMode(val)}
                    />
                    <div className="item-recurrence-container item-recurrence-container--new-task">
                        {mode === OCCASIONAL_MODE && (
                            <div className="form-group">
                                <label
                                    className="new-task-form_recurrence-label"
                                    htmlFor="new-task-form_recurrence-count"
                                >
                                    Repeat Every
                                </label>
                                <input
                                    {...register('numberOfRepetitions', { valueAsNumber: true, min: 1 })}
                                    id="new-task-form_recurrence-count"
                                    className="new-task-form_recurrence-count"
                                    type="number"
                                    min={1}
                                />
                                <select
                                    {...register('frequency')}
                                    className="select-input"
                                >
                                    {IntervalOptions.map(option => (
                                        <option key={option.key} value={option.key}>{option.title}(s)</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="form-group">
                            <label
                                className="new-task-form_recurrence-label"
                                htmlFor="new-task-form_recurrence-start-date"
                            >
                                Starting
                            </label>
                            <input
                                {...register('startDate')}
                                id="new-task-form_recurrence-start-date"
                                className="new-task-form_recurrence-start-date"
                                type="date"
                                onFocus={(e) => e.currentTarget.showPicker?.()}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                        </div>
                    </div>
                    <CategorySelect
                        id="new-task-form"
                        selectedCategory={watch('category')}
                        onChange={(category: string) => setValue('category', category)}
                    />
                    {errors.taskName && (
                        <div className="task-form-drawer__error">
                            {errors.taskName.message || 'Task name is required'}
                        </div>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};
export default DemoAddForm;
