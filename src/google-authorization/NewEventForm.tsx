import { useRef, useState } from 'react';
import { useForm, FormProvider, type SubmitHandler, useWatch, Controller } from 'react-hook-form';
import { API_AUTH_URL } from 'src/app/constants';
import { authHeaders } from 'src/authentication/authentication-api';
import { formatDate } from 'src/app/utilities/format-date';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';
import { formatGoogleEventDateTime } from 'src/google-authorization/utilities/format-google-event-date-time';
import { addOneDay } from 'src/google-authorization/utilities/add-one-day';
import { useToast } from 'src/toast/use-toast';
import 'src/task-form/task-form-shared.css';

type NewEventFormData = {
    title: string;
    allDay: boolean;
    start: string;
    end: string;
    startTime: string;
    endTime: string;
    note: string;
};

type NewEventFormProps = {
    setRightOpen: (open: boolean) => void;
};

const NewEventForm = ({ setRightOpen }: NewEventFormProps) => {
    const { loadCalendarEvents } = useGoogleCalendar();
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const noteRef = useRef<MDXEditorMethods>(null);

    const methods = useForm<NewEventFormData>({
        defaultValues: {
            title: '',
            allDay: true,
            start: formatDate(new Date()),
            end: formatDate(new Date()),
            startTime: '09:00',
            endTime: '10:00',
            note: '',
        },
    });

    const { register, handleSubmit, control, formState: { errors } } = methods;
    const allDay = useWatch({ control, name: 'allDay' });
    const watchNote = useWatch({ control, name: 'note' });
    const startDate = useWatch({ control, name: 'start' });
    const startTime = useWatch({ control, name: 'startTime' });
    const endDate = useWatch({ control, name: 'end' });
    const endTime = useWatch({ control, name: 'endTime' });
    const isEndDateTimeBeforeStartDateTime = () => {
        const startDateTime = formatGoogleEventDateTime(startDate, startTime);
        const endDateTime = formatGoogleEventDateTime(endDate, endTime);
        if (new Date(endDateTime) < new Date(startDateTime)) {
            return true;
        }
        return false;
    }
    const handleCreateEvent: SubmitHandler<NewEventFormData> = async (data) => {
        setIsSaving(true);

        try {
            const newEventPayload = {
                title: data.title,
                description: watchNote,
                allDay,
                start: allDay ? data.start : formatGoogleEventDateTime(data.start, startTime),
                end: allDay ? addOneDay(data.end) : formatGoogleEventDateTime(data.end, endTime),
            };

            const response = await fetch(`${API_AUTH_URL}/google/calendar/events`, {
                method: 'POST',
                headers: await authHeaders(),
                body: JSON.stringify(newEventPayload),
            });

            if (!response.ok) {
                let errorMessage = `Failed to create event: ${response.status}`;
                try {
                    const errorBody = await response.json();
                    if (typeof errorBody?.error === 'string' && errorBody.error.trim()) {
                        errorMessage = errorBody.error;
                    }
                } catch {
                    // Ignore JSON parsing failures and keep the status-based fallback message.
                }
                throw new Error(errorMessage);
            }

            await loadCalendarEvents({ skipConnectionCheck: true });
            showToast('Event created successfully', 'success');
            setRightOpen(false);
        } catch (error) {
            console.error('Creating calendar event failed:', error);
            showToast('Failed to create event: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <form
                className="task-form-drawer__body"
                onSubmit={handleSubmit(handleCreateEvent)}
            >
                <div className="task-form-field">
                    <label className="task-form-field__label" htmlFor="new-event-form-name">Event name</label>
                    <input
                        id="new-event-form-name"
                        className="task-form-input"
                        type="text"
                        placeholder="Event name"
                        {...register('title', { required: 'Event name is required' })}
                    />
                    {errors.title && <p className="task-form-field__error">{errors.title.message}</p>}
                </div>

                <div className="task-form-field">
                    <label className="task-form-field__label">All Day</label>
                    <input
                        id="new-event-form-all-day"
                        type="checkbox"
                        {...register('allDay')}
                        className="task-form-input task-form-checkbox"
                    />
                </div>

                <div className="task-form-field">
                    <label className="task-form-field__label" htmlFor="new-event-form-start">Starting</label>
                    <input
                        id="new-event-form-start"
                        className="task-form-input task-form-recurrence-start-date"
                        type="date"
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        {...register('start', { required: 'Start date is required' })}
                    />
                    {errors.start && <p className="task-form-field__error">{errors.start.message}</p>}
                </div>

                {!allDay && (
                    <div className="task-form-field">
                        <label className="task-form-field__label" htmlFor="new-event-form-start-time">Starting Time</label>
                        <input
                            className="task-form-input task-form-recurrence-start-date"
                            type="time"
                            {...register('startTime', { required: 'Start time is required' })}
                        />
                        {errors.startTime && <p className="task-form-field__error">{errors.startTime.message}</p>}
                    </div>
                )}

                <div className="task-form-field">
                    <label className="task-form-field__label" htmlFor="new-event-form-end">Ending</label>
                    <input
                        id="new-event-form-end"
                        className="task-form-input task-form-recurrence-start-date"
                        type="date"
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        {...register('end', {
                            required: 'End date is required',
                            validate: (value) => {
                                const startDateObj = parseDate(startDate);
                                const endDateObj = parseDate(value);
                                if (endDateObj < startDateObj) {
                                    return 'End date cannot be before start date';
                                }
                                return true;
                            }
                        })}
                    />
                    {errors.end && <p className="task-form-field__error">{errors.end.message}</p>}
                </div>

                {!allDay && (
                    <div className="task-form-field">
                        <label className="task-form-field__label" htmlFor="new-event-form-end-time">Ending Time</label>
                        <input
                            id="new-event-form-end-time"
                            className="task-form-input task-form-recurrence-start-date"
                            type="time"
                            {...register('endTime', {
                                required: 'End time is required', validate: () => {
                                    return isEndDateTimeBeforeStartDateTime() ? 'End date and time cannot be before start date and time' : true;
                                }
                            })}
                        />
                        {errors.endTime && <p className="task-form-field__error">{errors.endTime.message}</p>}
                    </div>
                )}

                <div className="task-form-field">
                    <label className="task-form-field__label">Notes</label>
                    <div className="edit-task-notes-wrap">
                        <Controller
                            name="note"
                            control={control}
                            render={({ field }) => (
                                <NoteEditor
                                    ref={noteRef}
                                    initialMarkdown={field.value ?? ''}
                                    onChange={field.onChange}
                                    readOnly={false}
                                />
                            )}
                        />
                    </div>
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
                        disabled={isSaving}
                        className="task-form-action-button task-form-action-button--save"
                        type="submit"
                        aria-label="Create event"
                    >
                        {isSaving ? <span>Saving...</span> : <span>Create</span>}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
};
// 2016-6-16
function parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export default NewEventForm;
