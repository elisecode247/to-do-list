import "./calendar-event-item.css";
import { isDateToday } from "src/utilities/is-date-today";
import DOMPurify from 'dompurify';
import { useState } from "react";
import { EyeClosed } from "lucide-react";

const CalendarEventItem = ({ event }: { event: any }) => {
    const [hidden, setHidden] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const isAllDayEvent = event.allDay;
    const dateString = isAllDayEvent
        ? `All Day ${isDateToday(event.end) ? "" : "until " + new Date(event.end).toLocaleDateString()}`
        : `${new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    const sanitizedHTML = DOMPurify.sanitize(event.note || '');
    if (hidden) return null;
    return (
        <div className="calendar-event-item">
            <div className="calendar-event-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h4>{event.title}</h4>
                    <p className="calendar-event-time">{dateString}</p>
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
                    <button
                        className="calendar-event_hide-button"
                        onClick={() => setHidden(true)}
                        aria-label="Hide event"
                    >
                        <EyeClosed size={24} />
                    </button>
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
