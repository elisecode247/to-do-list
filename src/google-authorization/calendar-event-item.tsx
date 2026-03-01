import "./calendar-event-item.css";
import DOMPurify from 'dompurify';
import { useState } from "react";
import { getEventDateString } from "./utilities/get-event-date-string";

export interface CalendarEvent {
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    note?: string | null;
    startDate: Date; // Parsed start date for easier handling
    endDate: Date; // Parsed end date for easier handling
}

const CalendarEventItem = ({ event }: { event: CalendarEvent }) => {
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const dateString = getEventDateString(event);

    const sanitizedHTML = DOMPurify.sanitize(event.note || '');

    return (
        <div className="calendar-event-item">
            <div className="calendar-event-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <p className="calendar-event-subtitle">Google Calendar Event</p>
                    <h4>{event.title}</h4>
                    <p className="sortable-item_next-due-text calendar-event-time">
                        {dateString}
                    </p>
                </div>
                <div className="calendar-event-controls">
                    {!!event.note && (
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
            {!event.note ? '' : !collapsed && (
                <div
                    className="calendar-event-description"
                    dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
                />
            )}
        </div>
    );
}

export default CalendarEventItem;
