import "./calendar-event-item.css";

const CalendarEventItem = ({ event }: { event: any }) => {
    return (
        <div className="calendar-event-item">
            <h4>{event.title}</h4>
            <p>{new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}</p>
        </div>
    );
}
export default CalendarEventItem;
