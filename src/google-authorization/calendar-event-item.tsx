import "./calendar-event-item.css";
import { useState } from "react";
import { getEventDateString } from "./utilities/get-event-date-string";
import type { GoogleEvent } from "./types";
import { getDaysFromNow } from 'src/utilities/days-ago';
import { sanitizeUserHtml } from "src/utilities/sanitize-html";
import { Ban, CalendarPlus2, BookMinus, BookPlus, Edit } from "lucide-react";

interface CalendarEventItemProps {
    event: GoogleEvent;
    onHideItem: (id: string, isHidden: boolean) => void;
    onEdit: (id: string) => void;
}

const CalendarEventItem = ({ event, onHideItem, onEdit }: CalendarEventItemProps) => {
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
                            className="sortable-item_main-button sortable-item_hide-button"
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? "Expand task" : "Collapse task"}
                            title={`${collapsed ? "Expand task to see details" : "Collapse task details"}`}
                            type="button"
                        >
                            {collapsed ? <BookMinus size={24} /> : <BookPlus size={24} />}
                            <span className="sortable-item_button-text-span">Notes</span>
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
                    <button
                        className="sortable-item_main-button sortable-item_edit-button"
                        onClick={() => {
                            onEdit(event.id);
                        }}
                        aria-label="Edit task"
                        title="Edit task"
                        type="button"
                    >
                        <Edit size={24} />
                        <span className="sortable-item_button-text-span">Edit</span>
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
