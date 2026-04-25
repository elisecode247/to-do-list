import {
    EndingConditionType,
    FrequencyType
} from 'src/app/types';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import './recurrence-form.css';
import { useFormContext, useWatch } from 'react-hook-form';

type WeekDay = {
    index: number;
    label: string;
    name: string;
};

const WEEK_DAYS: WeekDay[] = [
    { index: 0, label: 'S', name: 'Sunday' },
    { index: 1, label: 'M', name: 'Monday' },
    { index: 2, label: 'T', name: 'Tuesday' },
    { index: 3, label: 'W', name: 'Wednesday' },
    { index: 4, label: 'T', name: 'Thursday' },
    { index: 5, label: 'F', name: 'Friday' },
    { index: 6, label: 'S', name: 'Saturday' },
];

const FREQUENCY_OPTIONS = [
    { key: FrequencyType.Daily, title: 'day' },
    { key: FrequencyType.Weekly, title: 'week' },
    { key: FrequencyType.Monthly, title: 'month' },
    { key: FrequencyType.Annually, title: 'year' },
];

function getDayOfMonth(date: string): number {
    const parsedDate = localDateWithNowTime(date);
    if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date string provided to getDayOfMonth:', date);
        return 1;
    }
    return parsedDate.getDate();
};

function getWeekDayOfDate(date: string): number {
    const parsedDate = localDateWithNowTime(date);
    if (isNaN(parsedDate.getTime())) {
        console.warn('Invalid date string provided to getWeekDayOfDate:', date);
        return 0;
    }
    return parsedDate.getDay();
}

function getMonthlyWeekOfMonth(date: string): number {
    return Math.ceil(localDateWithNowTime(date).getDate() / 7);
}

function getOrdinal(value: number): string {
    if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
    switch (value % 10) {
        case 1:
            return `${value}st`;
        case 2:
            return `${value}nd`;
        case 3:
            return `${value}rd`;
        default:
            return `${value}th`;
    }
}

const RecurrenceForm = () => {
    const { register, watch, getValues, control } = useFormContext();
    const frequency = getValues('frequency') as FrequencyType;
    const startDate = getValues('startDate') as string;
    const isRepeating = getValues('isRepeating') as boolean;
    const endingCondition = getValues('endingCondition') as EndingConditionType;
    const watchFrequency = useWatch({ control, name: 'frequency', defaultValue: frequency });
    const weekDaysRepetition = getValues('weekDaysRepetition') as Array<number> || [];
    const watchIsRepeating = useWatch({
        control,
        name: "isRepeating",
        defaultValue: isRepeating,
    })
    const watchEndingCondition = useWatch({
        control,
        name: "endingCondition",
        defaultValue: endingCondition,
    });

    return (
        <div className="recurrence-form" aria-label="Custom recurrence form">
            <div className="recurrence-form__row">
                <label className="recurrence-form__label" htmlFor="recurrence-start-date">Starts on</label>
                <input
                    {...register('startDate', { required: true })}
                    id="recurrence-start-date"
                    type="date"
                    className="task-form-input recurrence-form__end-input"
                    onClick={(event) => event.currentTarget.showPicker?.()}
                />
            </div>
            <div className="recurrence-form__row">
                <label className="recurrence-form__label" htmlFor="calendar-end-date">Ends on</label>
                <input
                    {...register('endDate', { required: true })}
                    id="calendar-end-date"
                    type="date"
                    className="task-form-input recurrence-form__end-input"
                    onClick={(event) => event.currentTarget.showPicker?.()}
                />
            </div>

            <div className="recurrence-form__row recurrence-form__switch-row">
                <label className="recurrence-form__switch" htmlFor="recurrence-repeat-enabled">
                    <input
                        {...register('isRepeating')}
                        id="recurrence-repeat-enabled"
                        type="checkbox"
                        role="switch"
                    />
                    <span>Repeat</span>
                </label>
            </div>

            {watchIsRepeating && (
                <>
                    <div className="recurrence-form__row">
                        <span className="recurrence-form__label">Repeat every</span>
                        <input
                            {...register('numberOfRepetitions', { valueAsNumber: true, min: 1 })}
                            className="task-form-input recurrence-form__number"
                            type="number"
                            min={1}
                        />
                        <select
                            {...register('frequency')}
                            name="frequency"
                            className="task-form-input task-form-select"
                        >
                            {FREQUENCY_OPTIONS.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {watchFrequency === FrequencyType.Weekly && (
                        <div className="recurrence-form__row">
                            <span className="recurrence-form__label">Repeat on</span>
                            <div className="recurrence-form__weekday-row">
                                {WEEK_DAYS.map((day) => {
                                    const isSelected = weekDaysRepetition.includes(day.index);
                                    return (
                                        <label
                                            key={`weekday-${day.index}`}
                                            className="recurrence-form__weekday"
                                            aria-pressed={isSelected}
                                        >
                                            <input
                                                {...register('weekDaysRepetition', {
                                                    validate: (value) => {
                                                        if (!value) return 'Please select at least one day';
                                                        return (value.length === 0) ? false : true;
                                                    }
                                                })}
                                                name="weekDaysRepetition"
                                                type="checkbox"
                                                className="recurrence-form__weekday-input"
                                                aria-label={day.name}
                                                value={day.index}
                                            />
                                            <span className="recurrence-form__weekday-label" aria-hidden="true">
                                                {day.label}
                                            </span>
                                        </label>
                                    );
                                })
                                }
                            </div>
                        </div>
                    )}

                    {watchFrequency === FrequencyType.Monthly && (
                        <div className="recurrence-form__row">
                            <span className="recurrence-form__label">Repeat on</span>
                            <select
                                {...register('monthlyPattern', {
                                    validate: (value) => {
                                        if (watch('frequency') !== FrequencyType.Monthly) {
                                            return true;
                                        }
                                        return ['day-of-month', 'weekday-of-month'].includes(value) ||
                                            'Invalid monthly pattern';
                                    },
                                })}
                                name="monthlyPattern"
                                className="task-form-input task-form-select recurrence-form__monthly-select"
                            >
                                <option value="day-of-month">
                                    Monthly on day {getDayOfMonth(startDate)}
                                </option>
                                <option value="weekday-of-month">
                                    Monthly on the {getOrdinal(getMonthlyWeekOfMonth(startDate))} {WEEK_DAYS[getWeekDayOfDate(startDate)]?.name}
                                </option>
                            </select>
                        </div>
                    )}
                    <div className="recurrence-form__row">
                        <span className="recurrence-form__label">Repeat Ends</span>
                        <div role="radiogroup" aria-label="Recurrence ending" className="recurrence-form__end-group">
                            <label className="recurrence-form__end-option">
                                <input
                                    {...register('endingCondition')}
                                    className="recurrence-form__end-option-input"
                                    type="radio"
                                    name="endingCondition"
                                    value={EndingConditionType.None}
                                />
                                <span>Never</span>
                            </label>
                            <label className="recurrence-form__end-option">

                                <input
                                    {...register('endingCondition')}
                                    className="recurrence-form__end-option-input"
                                    type="radio"
                                    name="endingCondition"
                                    value={EndingConditionType.EndDate}
                                />
                                <span>On</span>
                                <input
                                    {...register('repeatEndDate', {
                                        validate: (value) => {

                                            if (watchEndingCondition !== EndingConditionType.EndDate) {
                                                return true;
                                            }
                                            const start = localDateWithNowTime(getValues('startDate') as string);
                                            const end = localDateWithNowTime(value);
                                            if (isNaN(end.getTime())) {
                                                return 'Please enter a valid end date';
                                            }
                                            if (end <= start) {
                                                return 'End date must be after start date';
                                            }
                                            return Boolean(value) || 'End date is required';
                                        },
                                    })}
                                    name="repeatEndDate"
                                    type="date"
                                    className="task-form-input recurrence-form__end-input"
                                    onClick={(event) => event.currentTarget.showPicker?.()}
                                />
                            </label>

                            <label className="recurrence-form__end-option">
                                <input
                                    {...register('endingCondition')}
                                    className="recurrence-form__end-option-input"
                                    type="radio"
                                    value={EndingConditionType.OccurrencesNumber}
                                />
                                After
                                <input
                                    {...register('endingOccurrencesNumber', {
                                        validate: (value) => {
                                            if (watchEndingCondition !== EndingConditionType.OccurrencesNumber) {
                                                return true;
                                            }
                                            if (!value || isNaN(value)) {
                                                return 'Please enter a valid number of occurrences';
                                            }
                                            if (value <= 0) {
                                                return 'Number of occurrences must be at least 1';
                                            }
                                            return true;
                                        },
                                    })}
                                    min={1}
                                    type="number"
                                    className="task-form-input recurrence-form__end-input"
                                />
                                occurrences
                            </label>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecurrenceForm;
