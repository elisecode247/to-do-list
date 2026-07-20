import { useEffect, useState } from 'react';
import FrequencyButtonGroup from 'src/new-task-form/frequency-button-group';
import CategorySelect from 'category-select/CategorySelect';
import { useDemoTask } from 'src/pages/demo/use-demo-task';
import { useToast } from 'src/toast/use-toast';
import { IntervalOptions, type Mode, type OneTimeRecurrence } from 'app/types';
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
import CloseButton from 'components/close-button/CloseButton';
import { ListTodo, CalendarCheck } from 'lucide-react';
import 'src/new-task-form/new-task-form.css';
import 'src/task-form/new-form.css';
import 'src/task-form/task-form-shared.css';
import type { CategoryDefinition } from 'src/category-select/types';

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

type DemoAddFormProps = {
    isDesktop: boolean;
    setRightOpen: (open: boolean) => void;
    categories: CategoryDefinition[];
};

type FormType = 'task' | 'event';

const DemoTaskForm = ({ setRightOpen, categories }: Pick<DemoAddFormProps, 'setRightOpen' | 'categories'>) => {
    const { addItem } = useDemoTask();
    const { showToast } = useToast();
    const [mode, setMode] = useState<Mode>(ONE_TIME_MODE);

    const defaultValues: DemoAddFormValues = {
        taskName: '',
        category: '',
        startDate: formatDate(new Date()),
        isRepeating: false,
        numberOfRepetitions: 1,
        frequency: FrequencyType.Daily,
        endDate: formatDate(new Date()),
    };

    const methods = useForm<DemoAddFormValues>({ defaultValues });
    const { register, handleSubmit, reset, formState: { errors, isSubmitSuccessful } } = methods;

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
            isOwner: true,
            hasMembers: false,
            accessRole: 'owner',
            itemType: 'checklist-item',
            id: crypto.randomUUID(),
            text: data.taskName,
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            tabSortOrder: {},
            category: data.category,
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
            setRightOpen(false);
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
                <div className="task-form-drawer__body">
                    <div className="task-form-field">
                        <label className="task-form-field__label" htmlFor="new-task-form-text-input">Task name</label>
                        <input
                            {...register('taskName', { required: true })}
                            id="new-task-form-text-input"
                            className="task-form-input"
                            placeholder="New item..."
                        />
                    </div>

                    <div className="task-form-field">
                        <label className="task-form-field__label">Category</label>
                        <div className="task-form-category-wrap">
                            <CategorySelect
                                id="new-task-form"
                                categories={categories}
                            />
                        </div>
                    </div>

                    <div className="task-form-field">
                        <div className="task-form-section-divider">Schedule</div>
                        <FrequencyButtonGroup
                            mode={mode}
                            onClick={(val: Mode) => setMode(val)}
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
                                        {...register('numberOfRepetitions', { valueAsNumber: true, min: 1 })}
                                        id="new-task-form_recurrence-count"
                                        className="task-form-input task-form-recurrence-count"
                                        type="number"
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
                            <label
                                className="task-form-field__label"
                                htmlFor="new-task-form_recurrence-start-date"
                            >
                                Starting
                            </label>
                            <input
                                {...register('startDate')}
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
    );
};

const DemoEventUnavailable = ({ setRightOpen }: Pick<DemoAddFormProps, 'setRightOpen'>) => {
    return (
        <div className="task-form-drawer__body">
            <div className="task-form-field">
                <p>Events are disabled in demo mode.</p>
                <p>Use the main app after signing in to create Google Calendar events.</p>
            </div>
            <div className="task-form-drawer__footer">
                <button
                    className="task-form-action-button task-form-action-button--cancel"
                    onClick={() => setRightOpen(false)}
                    type="button"
                    aria-label="Close form"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const DemoAddForm = ({ isDesktop, setRightOpen, categories }: DemoAddFormProps) => {
    const [formType, setFormType] = useState<FormType>('task');

    return (
        <div className="task-form-drawer">
            <div className="task-form-drawer__header">
                <div
                    className="form-type-toggle"
                    role="tablist"
                    aria-label="Create type"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={formType === 'task'}
                        className={`form-type-toggle__btn${formType === 'task' ? ' form-type-toggle__btn--active' : ''}`}
                        onClick={() => setFormType('task')}
                    >
                        <ListTodo className="form-type-toggle__icon" />
                        Task
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={formType === 'event'}
                        className={`form-type-toggle__btn${formType === 'event' ? ' form-type-toggle__btn--active' : ''}`}
                        onClick={() => setFormType('event')}
                    >
                        <CalendarCheck className="form-type-toggle__icon" />
                        Event
                    </button>
                </div>

                {isDesktop && (
                    <CloseButton
                        onClick={() => setRightOpen(false)}
                        label="Close new task form"
                    />
                )}
            </div>

            {formType === 'task' ? (
                <DemoTaskForm setRightOpen={setRightOpen} categories={categories} />
            ) : (
                <DemoEventUnavailable setRightOpen={setRightOpen} />
            )}
        </div>
    );
};

export default DemoAddForm;
