import { useEffect, useMemo, useState } from 'react';
import {
	CALENDAR_RECURRENCE_TYPE,
	EndingConditionType,
	FrequencyType,
	type CalendarRecurrence,
} from 'src/app/types';
import { localDateWithNowTime } from 'src/app/utilities/add-now-to-local-date';
import './recurrence-form.css';

type RecurrenceFormProps = {
	value?: CalendarRecurrence | null;
	startDate?: Date;
	onChange?: (value: CalendarRecurrence) => void;
	disabled?: boolean;
};

type WeekDay = {
	index: number;
	label: string;
	name: string;
};

type MonthlyPattern = 'day-of-month' | 'weekday-of-month';

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

function formatDateForInput(date: Date | undefined): string {
	if (!date) return '';
    if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
        } else {
            console.warn('Invalid date string provided to formatDateForInput:', date);
            return '';
        }
    }
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function normalizeWeekdays(days: number[]): number[] {
	return [...new Set(days)].sort((a, b) => a - b);
}

function getMonthlyWeekOfMonth(date: Date): number {
	return Math.ceil(date.getDate() / 7);
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

function getInitialMonthlyPattern(value: CalendarRecurrence | null | undefined): MonthlyPattern {
	if (value?.frequency === FrequencyType.Monthly && value.weekDaysRepetition?.length) {
		return 'weekday-of-month';
	}
	return 'day-of-month';
}

function getInitialWeekdays(value: CalendarRecurrence | null | undefined, startDate: Date): number[] {
	if (value?.weekDaysRepetition?.length) {
		return normalizeWeekdays(value.weekDaysRepetition);
	}
	return [startDate.getDay()];
}

const RecurrenceForm = ({
	value,
	startDate,
	onChange,
	disabled = false,
}: RecurrenceFormProps) => {
	const initialStartDate = useMemo(
		() => value?.startDate ?? startDate ?? new Date(),
		[value?.startDate, startDate]
	);

	const [startDateValue, setStartDateValue] = useState<string>(formatDateForInput(initialStartDate));
	const [isRepeating, setIsRepeating] = useState<boolean>(value?.frequency !== FrequencyType.None);
	const [every, setEvery] = useState<number>(value?.numberOfRepetitions ?? 1);
	const [frequency, setFrequency] = useState<CalendarRecurrence['frequency']>(value?.frequency ?? FrequencyType.Weekly);
	const [weekDaysRepetition, setWeekDaysRepetition] = useState<number[]>(getInitialWeekdays(value, initialStartDate));
	const [monthlyPattern, setMonthlyPattern] = useState<MonthlyPattern>(getInitialMonthlyPattern(value));
	const [endingCondition, setEndingCondition] = useState<CalendarRecurrence['endingCondition']>(
		value?.endingCondition ?? EndingConditionType.None
	);
	const [endDate, setEndDate] = useState<string>(formatDateForInput(value?.endDate));
	const [endingOccurrencesNumber, setEndingOccurrencesNumber] = useState<number>(value?.endingOccurrencesNumber ?? 10);

	const recurrenceStartDate = useMemo(() => {
		if (!startDateValue) return initialStartDate;
		return new Date(localDateWithNowTime(startDateValue));
	}, [initialStartDate, startDateValue]);

	useEffect(() => {
		const monthlyWeekday = recurrenceStartDate.getDay();
		const weeklyDays = normalizeWeekdays(weekDaysRepetition);
		const monthlyDays = monthlyPattern === 'weekday-of-month' ? [monthlyWeekday] : [];
		const effectiveFrequency = isRepeating ? frequency : FrequencyType.None;

		const recurrence: CalendarRecurrence = {
			type: CALENDAR_RECURRENCE_TYPE,
			startDate: recurrenceStartDate,
			frequency: effectiveFrequency,
			numberOfRepetitions: isRepeating ? every : undefined,
			weekDaysRepetition:
				effectiveFrequency === FrequencyType.Weekly
					? weeklyDays
					: effectiveFrequency === FrequencyType.Monthly
						? monthlyDays
						: [],
			endingCondition: isRepeating ? endingCondition : EndingConditionType.None,
			endingOccurrencesNumber:
				isRepeating && endingCondition === EndingConditionType.OccurrencesNumber ? endingOccurrencesNumber : undefined,
			endDate:
				isRepeating && endingCondition === EndingConditionType.EndDate && endDate
					? new Date(localDateWithNowTime(endDate))
					: undefined,
			isAllDay: value?.isAllDay ?? true,
			startTime: value?.startTime,
			endTime: value?.endTime,
		};
		onChange?.(recurrence);
	}, [
		endDate,
		endingCondition,
		endingOccurrencesNumber,
		every,
		frequency,
		isRepeating,
		monthlyPattern,
		onChange,
		recurrenceStartDate,
		startDateValue,
		value?.endTime,
		value?.isAllDay,
		value?.startTime,
		weekDaysRepetition,
	]);

	const toggleWeekDay = (dayIndex: number) => {
		setWeekDaysRepetition((prev) => {
			const exists = prev.includes(dayIndex);
			if (exists && prev.length === 1) {
				return prev;
			}
			return exists
				? prev.filter((day) => day !== dayIndex)
				: normalizeWeekdays([...prev, dayIndex]);
		});
	};

	return (
		<div className="recurrence-form" aria-label="Custom recurrence form">
			<div className="recurrence-form__row">
				<label className="recurrence-form__label" htmlFor="recurrence-start-date">Starts on</label>
				<input
					id="recurrence-start-date"
					type="date"
					className="task-form-input recurrence-form__end-input"
					value={startDateValue}
					disabled={disabled}
					onClick={(event) => event.currentTarget.showPicker?.()}
					onChange={(event) => setStartDateValue(event.target.value)}
				/>
			</div>

			<div className="recurrence-form__row recurrence-form__switch-row">
				<label className="recurrence-form__switch" htmlFor="recurrence-repeat-enabled">
					<input
						id="recurrence-repeat-enabled"
						type="checkbox"
						role="switch"
						checked={isRepeating}
						disabled={disabled}
						onChange={(event) => setIsRepeating(event.target.checked)}
					/>
					<span>Repeat</span>
				</label>
			</div>

			{isRepeating && (
				<>
					<div className="recurrence-form__row">
						<span className="recurrence-form__label">Repeat every</span>
						<input
							className="task-form-input recurrence-form__number"
							type="number"
							min={1}
							value={every}
							disabled={disabled}
							onChange={(event) => {
								const value = Number.parseInt(event.target.value, 10);
								if (Number.isNaN(value) || value < 1) return;
								setEvery(value);
							}}
						/>
						<select
							className="task-form-input task-form-select"
							value={frequency}
							disabled={disabled}
							onChange={(event) => setFrequency(event.target.value as CalendarRecurrence['frequency'])}
						>
							{FREQUENCY_OPTIONS.map((option) => (
								<option key={option.key} value={option.key}>
									{option.title}
								</option>
							))}
						</select>
					</div>

					{frequency === FrequencyType.Weekly && (
				<div className="recurrence-form__row">
					<span className="recurrence-form__label">Repeat on</span>
					<div className="recurrence-form__weekday-row">
						{WEEK_DAYS.map((day) => {
							const isSelected = weekDaysRepetition.includes(day.index);
							return (
								<button
									key={day.index}
									type="button"
									className="recurrence-form__weekday"
									aria-label={day.name}
									aria-pressed={isSelected}
									disabled={disabled}
									onClick={() => toggleWeekDay(day.index)}
								>
									{day.label}
								</button>
							);
						})}
					</div>
				</div>
					)}

					{frequency === FrequencyType.Monthly && (
				<div className="recurrence-form__row">
					<span className="recurrence-form__label">Repeat on</span>
					<select
						className="task-form-input task-form-select recurrence-form__monthly-select"
						value={monthlyPattern}
						disabled={disabled}
						onChange={(event) => setMonthlyPattern(event.target.value as MonthlyPattern)}
					>
						<option value="day-of-month">
							Monthly on day {recurrenceStartDate.getDate()}
						</option>
						<option value="weekday-of-month">
							Monthly on the {getOrdinal(getMonthlyWeekOfMonth(recurrenceStartDate))} {WEEK_DAYS[recurrenceStartDate.getDay()]?.name}
						</option>
					</select>
				</div>
					)}
            </>)}
					<div className="recurrence-form__row">
				<span className="recurrence-form__label">Ends</span>
				<div role="radiogroup" aria-label="Recurrence ending" className="recurrence-form__end-group">
					<label className="recurrence-form__end-option">
						<input
                            className="recurrence-form__end-option-input"
							type="radio"
							name="recurrence-ending"
							value={EndingConditionType.None}
							checked={endingCondition === EndingConditionType.None}
							disabled={disabled}
							onChange={() => setEndingCondition(EndingConditionType.None)}
						/>
						<span>Never</span>
					</label>

					<label className="recurrence-form__end-option">
						<input
                            className="recurrence-form__end-option-input"
							type="radio"
							name="recurrence-ending"
							value={EndingConditionType.EndDate}
							checked={endingCondition === EndingConditionType.EndDate}
							disabled={disabled}
							onChange={() => setEndingCondition(EndingConditionType.EndDate)}
						/>
						<span>On</span>
						<input
							type="date"
							className="task-form-input recurrence-form__end-input"
							value={endDate}
							disabled={disabled || endingCondition !== EndingConditionType.EndDate}
							onClick={(event) => event.currentTarget.showPicker?.()}
							onChange={(event) => setEndDate(event.target.value)}
						/>
					</label>

					<label className="recurrence-form__end-option">
						<input
                            className="recurrence-form__end-option-input"
							type="radio"
							name="recurrence-ending"
							value={EndingConditionType.OccurrencesNumber}
							checked={endingCondition === EndingConditionType.OccurrencesNumber}
							disabled={disabled}
							onChange={() => setEndingCondition(EndingConditionType.OccurrencesNumber)}
						/>
						After
						<input
							type="number"
							min={1}
							className="task-form-input recurrence-form__end-input"
							value={endingOccurrencesNumber}
							disabled={disabled || endingCondition !== EndingConditionType.OccurrencesNumber}
							onChange={(event) => {
								const value = Number.parseInt(event.target.value, 10);
								if (Number.isNaN(value) || value < 1) return;
								setEndingOccurrencesNumber(value);
							}}
						/>
						occurrences
					</label>
				</div>
			</div>
		</div>
	);
};

export default RecurrenceForm;
