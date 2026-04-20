import "./calendar-event-item.css";
import DOMPurify from 'dompurify';
import { useState } from "react";
import { getEventDateString } from "./utilities/get-event-date-string";
import type { GoogleEvent } from "./types";
import { getDaysFromNow } from 'src/utilities/days-ago';

export interface CalendarEvent {
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    note?: string | null;
    startDate: Date; // Parsed start date for easier handling
    endDate: Date; // Parsed end date for easier handling
    description: string;
}

const CalendarEventItem = ({ event }: { event: GoogleEvent }) => {
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const dateString = getEventDateString(event);
    const countDownString = getDaysFromNow(event.startDate);

    const sanitizedHTML = DOMPurify.sanitize(event.description || '');

    return (
        <div className="calendar-event-item">
            <div className="calendar-event-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p className="calendar-event-subtitle">Google Calendar Event</p>
                    <h4>{event.title}</h4>
                    <p className="sortable-item_next-due-text calendar-event-time">
                        {countDownString} - {dateString}
                    </p>
                </div>
                <div className="calendar-event-controls">
                    {!!event.description && (
                        <button
                            onClick={toggleCollapsed}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1.2rem",
                            }}
                            aria-label={collapsed ? "Expand event" : "Collapse event"}
                        >
                            {collapsed ? "➕" : "➖"}
                        </button>
                    )}
                </div>
            </div>

            {/* Description */}
            {!event.description ? '' : !collapsed && (
                <div
                    className="calendar-event-description"
                    dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
            )}
        </div>
    );
}

export default CalendarEventItem;
