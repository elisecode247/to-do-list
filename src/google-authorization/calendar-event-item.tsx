import "./calendar-event-item.css";
import { useState } from "react";
import { getEventDateString } from "./utilities/get-event-date-string";
import type { GoogleEvent } from "./types";
import { getDaysFromNow } from 'src/utilities/days-ago';
import { sanitizeUserHtml } from "src/utilities/sanitize-html";
import { Ban, CalendarPlus2 } from "lucide-react";

interface CalendarEventItemProps {
    event: GoogleEvent;
    onHideItem: (id: string, isHidden: boolean) => void;
}

const CalendarEventItem = ({ event, onHideItem }: CalendarEventItemProps) => {
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const dateString = getEventDateString(event);
    const countDownString = getDaysFromNow(event.startDate);

    const sanitizedHTML = sanitizeUserHtml(event.description || '');
    async function delayHide() {
        onHideItem(event.id, event.isHidden);
    }
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
                    <button
                        className="sortable-item_main-button sortable-item_hide-button"
                        onClick={delayHide}
                        aria-label="Skip task"
                        title={event.isHidden ? "Do task for today" : "Skip task for today"}
                        type="button"
                    >
                        {event.isHidden ? <CalendarPlus2 size={24} /> : <Ban size={24} />}
                        <span className="sortable-item_button-text-span">
                            {event.isHidden ? "Do Today" : "Skip"}
                        </span>
                    </button>
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
