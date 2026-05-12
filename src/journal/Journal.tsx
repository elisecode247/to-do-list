import { useState, useRef, useEffect, useCallback } from "react";
import "./journal.css";
import type { JournalEntry } from "./types";
import { useJournal } from "./use-journal";
import { v4 as uuidv4 } from "uuid";
import { useDebounceCallback } from 'usehooks-ts';
import { ArrowBigLeft, ArrowBigRight, HelpCircle } from "lucide-react";
import Guide from "./Guide";

// e.g. "2026-05-07"
function formatDate(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const day = d.getDate();
    const year = d.getFullYear();
    return `${year}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function offsetBadge(offset: number) {
    if (offset === 0) return "today";
    if (offset === -1) return "yesterday";
    if (offset === 1) return "tomorrow";
    return null;
}

function toTimeInputValue(entryTime: string): string {
    const parsed = new Date(entryTime);
    if (Number.isNaN(parsed.getTime())) return "";
    const hours = String(parsed.getHours()).padStart(2, "0");
    const minutes = String(parsed.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function toEntryTimeIso(timeValue: string, day: string, fallbackIso: string): string {
    const [hoursRaw, minutesRaw] = timeValue.split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
        return fallbackIso;
    }

    const normalizedDay = day.includes("T") ? day.slice(0, 10) : day;
    const base = new Date(`${normalizedDay}T00:00:00`);

    if (Number.isNaN(base.getTime())) {
        return fallbackIso;
    }

    base.setHours(hours, minutes, 0, 0);
    return base.toISOString();
}

function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder?: string; autoFocus?: boolean }) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = ref.current.scrollHeight + "px";
        }
    }, [value]);

    return (
        <textarea
            ref={ref}
            className="entry-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
        />
    );
}

function EntryRow({ entry, onChange, onToggleDistraction, onDelete }: { entry: JournalEntry; onChange: (id: string, field: keyof JournalEntry, value: string) => void; onToggleDistraction: (id: string) => void; onDelete: (id: string) => void }) {
    const [text, setText] = useState(entry.text);
    const [time, setTime] = useState(toTimeInputValue(entry.entryTime));
    const handleTextChange = (value: string) => {
        setText(value);
        onChange(entry.id, 'text', value);
    }
    const handleTimeChange = (value: string) => {
        setTime(value);
        onChange(entry.id, 'entryTime', toEntryTimeIso(value, entry.day, entry.entryTime));
    }
    return (
        <div className={`entry-row${entry.distraction ? " entry-row--distraction" : ""}`}>
            <div className="time-cell">
                <button className="delete-btn" onClick={() => onDelete(entry.id)}>×</button>
                <input
                    className="time-input"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    placeholder="0:00 AM"
                    aria-label="JournalEntry time"
                    type="time"
                />
            </div>
            <div className="note-cell">
                <AutoTextarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder="What just happened? How do you feel? What's next?"
                />
                <button
                    className={`distraction-tag${entry.distraction ? " distraction-tag--active" : ""}`}
                    onClick={() => onToggleDistraction(entry.id)}
                    title={entry.distraction ? "Remove distraction tag" : "Mark as distraction"}
                >
                    {entry.distraction ? "distraction" : "+"}
                </button>
            </div>
        </div>
    );
}

export default function Journal() {
    const { entries, loadJournalEntries, updateJournalEntry, deleteJournalEntry, addJournalEntry } = useJournal();
    const [offset, setOffset] = useState(0);
    const [guideOpen, setGuideOpen] = useState(false);
    const debouncedUpdate = useDebounceCallback(updateJournalEntry, 1000);
    const selectedDay = formatDate(offset);

    useEffect(() => {
        void loadJournalEntries(selectedDay);
    }, [loadJournalEntries, selectedDay]);

    const handleChange = useCallback((id: string, field: keyof JournalEntry, value: string) => {
        const entry = entries.find((e) => e.id === id);
        if (entry) {
            debouncedUpdate({ ...entry, [field]: value });
        }
    }, [entries, debouncedUpdate]);

    const handleDelete = useCallback((id: string) => {
        deleteJournalEntry(id);
    }, [deleteJournalEntry]);

    const handleToggleDistraction = useCallback((id: string) => {
        const entry = entries.find((e) => e.id === id);
        if (entry) {
            debouncedUpdate({ ...entry, distraction: !entry.distraction });
        }
    }, [entries, debouncedUpdate]);

    const addEntry = () => {

        const id = uuidv4();
        addJournalEntry({
            id,
            entryTime: new Date().toISOString(),
            text: "",
            distraction: false,
            day: selectedDay
        });
    };

    const handleCalendarJump = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        const today = formatDate(0);
        const newOffset = Math.round((new Date(newDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        setOffset(newOffset);
    };

    const badge = offsetBadge(offset);

    return (
        <div className="journal-page">
            <div className="journal-wrap">

                <div className="journal-header">
                    <div className="date-nav">
                        <button className="journal-nav-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Previous day">
                            <ArrowBigLeft size={20} />
                        </button>
                        <input
                            name="calendar-jump"
                            id="calendar-jump"
                            className="date-label calendar-jump-input"
                            type="date"
                            onFocus={(e) => e.currentTarget.showPicker?.()}
                            onClick={(e) => e.currentTarget.showPicker?.()}
                            onChange={handleCalendarJump}
                            value={selectedDay}
                        />
                        <button className="journal-nav-btn" onClick={() => setOffset((o) => o + 1)} aria-label="Next day">
                            <ArrowBigRight size={20} />
                        </button>
                        {badge && <span className="today-badge">{badge}</span>}
                    </div>
                    <div className="header-right">
                            <button
                                className="guide-toggle"
                                onClick={() => setGuideOpen((o) => !o)}
                                aria-label="Show guide"
                                title="How to write an entry"
                            >
                                <HelpCircle size={24} />
                            </button>
                        </div>
                </div>

                <div className="journal-reminder" aria-label="Journal writing reminder">
                    <span className="journal-reminder-step">
                        <span className="journal-reminder-num">1)</span> what you finished
                    </span>
                    <span className="journal-reminder-step">
                        <span className="journal-reminder-num">2)</span> how you feel
                    </span>
                    <span className="journal-reminder-step">
                        <span className="journal-reminder-num">3)</span> what's next
                    </span>
                    <div className="guide-popup-hint">
                        <span className="guide-popup-hint-icon">!</span>
                        If distracted — log it, then return
                    </div>
                </div>

                {guideOpen && (
                    <Guide onGuideOpen={setGuideOpen} />
                )}

                <div className="col-headers">
                    <div className="col-hdr">Time</div>
                    <div className="col-hdr">Entry</div>
                </div>

                <div className="entries">
                    {entries.map((entry: JournalEntry) => (
                        <EntryRow
                            key={entry.id}
                            entry={entry}
                            onChange={handleChange}
                            onDelete={handleDelete}
                            onToggleDistraction={handleToggleDistraction}
                        />
                    ))}
                </div>

                <button className="add-row-btn" onClick={addEntry}>
                    <span className="add-icon">+</span>
                    Add entry
                </button>

            </div>
        </div>
    );
}
