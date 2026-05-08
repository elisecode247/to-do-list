import { useState, useRef, useEffect, useCallback } from "react";
import "./Journal.css";
import type { JournalEntry } from "./types";
import { useJournal } from "./use-journal";
import { v4 as uuidv4 } from "uuid";
import { useDebounceCallback } from 'usehooks-ts';

const GUIDE_ITEMS = [
    { icon: "✓", label: "What I just finished" },
    { icon: "~", label: "Thoughts & feelings" },
    { icon: "→", label: "My next action" },
    { icon: "◎", label: "What I expect (optional)" },
    { icon: "≡", label: "Anything else worth noting" },
];

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
    const { entries, updateJournalEntry, deleteJournalEntry, addJournalEntry } = useJournal();
    const [offset, setOffset] = useState(0);
    const [guideOpen, setGuideOpen] = useState(true);
    const debouncedUpdate = useDebounceCallback(updateJournalEntry, 1000);

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
            day: formatDate(offset)
        });
    };

    const badge = offsetBadge(offset);

    return (
        <div className="journal-page">
            <div className="journal-wrap">

                <div className="journal-header">
                    <div className="date-nav">
                        <button className="journal-nav-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Previous day">
                            ‹
                        </button>
                        <span className="date-label">{formatDate(offset)}</span>
                        <button className="journal-nav-btn" onClick={() => setOffset((o) => o + 1)} aria-label="Next day">
                            ›
                        </button>
                    </div>
                    <div className="header-right">
                        {badge && <span className="today-badge">{badge}</span>}
                        <button className="cal-btn">
                            <span className="cal-icon">⊞</span>
                            Jump to date
                        </button>
                    </div>
                </div>

                <div className="guide-bar">
                    <button
                        className="guide-toggle"
                        onClick={() => setGuideOpen((o) => !o)}
                        aria-label="Toggle guide"
                    >
                        {guideOpen ? "▾" : "▸"}
                    </button>
                    <div className="guide-content">
                        <div className="guide-title">What to write in each entry</div>
                        {guideOpen && (
                            <div className="guide-pills">
                                {GUIDE_ITEMS.map((item) => (
                                    <span key={item.label} className="guide-pill">
                                        <span className="guide-pill-icon">{item.icon}</span>
                                        {item.label}
                                    </span>
                                ))}
                                <span className="guide-pill guide-pill--distract">
                                    <span className="guide-pill-icon">!</span>
                                    If distracted — log it, then return
                                </span>
                            </div>
                        )}
                    </div>
                </div>

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
