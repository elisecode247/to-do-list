import { useState, useRef, useEffect, useCallback } from "react";
import "./journal.css";
import type { JournalEntry } from "./types";
import { useJournal } from "./use-journal";
import { v4 as uuidv4 } from "uuid";
import { useDebounceCallback } from 'usehooks-ts';
import { MoveLeft, MoveRight, HelpCircle, Unlock, Lock, X, Plus } from "lucide-react";
import JournalLockScreen from 'src/journal/JournalLockScreen';
import { useEncryptionKey } from 'src/encryption/encryption-key-context';
import { useTheme } from 'src/themes/use-theme';

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

function AutoTextarea({ value, onChange, placeholder, id }: { value: string; onChange: (val: string) => void; placeholder?: string; autoFocus?: boolean; id?: string }) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = ref.current.scrollHeight + "px";
        }
    }, [value]);

    return (
        <textarea
            id={id}
            ref={ref}
            className="entry-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
        />
    );
}

function EntryRow({ entry, onChange, onToggleDistraction, onDelete }: { entry: JournalEntry; onChange: (id: string, field: keyof JournalEntry, value: string) => void; onToggleDistraction: (id: string, distraction: boolean) => void; onDelete: (id: string) => void }) {
    const [text, setText] = useState(entry.text);
    const [time, setTime] = useState(toTimeInputValue(entry.entryTime));
    const [isDistraction, setIsDistraction] = useState(entry.distraction);

    const handleTextChange = (value: string) => {
        setText(value);
        onChange(entry.id, 'text', value);
    }
    const handleTimeChange = (value: string) => {
        setTime(value);
        onChange(entry.id, 'entryTime', toEntryTimeIso(value, entry.day, entry.entryTime));
    }
    const handleToggleDistraction = () => {
        const nextDistraction = !isDistraction;
        setIsDistraction(nextDistraction);
        onToggleDistraction(entry.id, nextDistraction);
    }
    return (
        <div className={`entry-row${isDistraction ? " entry-row--distraction" : ""}`}>
            <span className="entry-node" aria-hidden="true" />
            <div className="entry-card">
                <div className="entry-card-top">
                    <input
                        className="time-input"
                        value={time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        aria-label="Journal entry time"
                        type="time"
                    />
                    <div className="entry-card-actions">
                        <button
                            className={`distraction-tag${isDistraction ? " distraction-tag--active" : ""}`}
                            onClick={handleToggleDistraction}
                            aria-label={isDistraction ? "Remove distraction tag" : "Mark as distraction"}
                            title={isDistraction ? "Remove distraction tag" : "Mark as distraction"}
                        >
                            Distraction
                        </button>
                        <button
                            className="delete-entry-btn"
                            onClick={() => onDelete(entry.id)}
                            aria-label="Delete journal entry"
                            type="button"
                        >
                            <X aria-hidden="true" size={16} />
                        </button>
                    </div>
                </div>
                <AutoTextarea
                    id={`entry-textarea-${entry.id}`}
                    value={text}
                    onChange={handleTextChange}
                    placeholder="What just happened? How do you feel? What's next?"
                />
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
    const { isUnlocked, isEncryptionEnabled } = useEncryptionKey();
    const { toggleIconText } = useTheme();

    useEffect(() => {
        if (isEncryptionEnabled && !isUnlocked) {
            return;
        }
        void loadJournalEntries(selectedDay);
    }, [loadJournalEntries, selectedDay, isEncryptionEnabled, isUnlocked]);

    const handleChange = useCallback((id: string, field: keyof JournalEntry, value: string) => {
        const entry = entries.find((e) => e.id === id);
        if (entry) {
            debouncedUpdate({ ...entry, [field]: value });
        }
    }, [entries, debouncedUpdate]);

    const handleDelete = useCallback((id: string) => {
        deleteJournalEntry(id);
    }, [deleteJournalEntry]);

    const handleToggleDistraction = useCallback((id: string, distraction: boolean) => {
        const entry = entries.find((e) => e.id === id);
        if (entry) {
            void updateJournalEntry({ ...entry, distraction });
        }
    }, [entries, updateJournalEntry]);

    const addEntry = () => {

        const id = uuidv4();
        addJournalEntry({
            id,
            entryTime: new Date().toISOString(),
            text: "",
            distraction: false,
            day: selectedDay,
            ciphertext: "",
            iv: "",
            encryptionVersion: 1,
        });
    };

    const handleCalendarJump = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        const today = formatDate(0);
        const newOffset = Math.round((new Date(newDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
        setOffset(newOffset);
    };

    const badge = offsetBadge(offset);

    if (isEncryptionEnabled && !isUnlocked) {
        return <JournalLockScreen />;
    }

    return (
        <div className="journal-page">
            <div className="journal-wrap">

                <div className="journal-header">
                    {/* aria only label for screen readers */}
                    <h2 className="sr-only">Journal</h2>
                    <div className="header-left">
                        <div className="date-nav">
                            <button className="journal-nav-btn" onClick={() => setOffset((o) => o - 1)} aria-label="Previous day">
                                <MoveLeft size={18} />
                            </button>
                            <input
                                name="calendar-jump"
                                id="calendar-jump"
                                className="calendar-jump-input"
                                type="date"
                                onFocus={(e) => e.currentTarget.showPicker?.()}
                                onClick={(e) => e.currentTarget.showPicker?.()}
                                onChange={handleCalendarJump}
                                value={selectedDay}
                            />
                            <button className="journal-nav-btn" onClick={() => setOffset((o) => o + 1)} aria-label="Next day">
                                <MoveRight size={18} />
                            </button>
                        </div>
                        {badge && <span className="today-badge">{badge}</span>}
                    </div>
                    <div className="header-right">
                        <span className="journal-chip">
                            {isEncryptionEnabled ? (
                                <Lock size={13} strokeWidth={2} aria-hidden="true" />
                            ) : (
                                <Unlock size={13} strokeWidth={2} aria-hidden="true" />
                            )}
                            {toggleIconText === 'true' && (
                                <span className="journal-encryption-status">
                                    {isEncryptionEnabled ? "Encrypted" : "Unencrypted"}
                                </span>
                            )}
                        </span>
                        <button
                            className="guide-toggle"
                            onClick={() => setGuideOpen((o) => !o)}
                            aria-label="Show guide"
                            title="How to write an entry"
                        >
                            <HelpCircle size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>
                {guideOpen && (
                    <div className="journal-reminder" aria-label="Journal writing reminder">
                        <div className="journal-reminder-steps">
                            <span className="journal-reminder-step">
                                <span className="journal-reminder-num">1</span> what you finished
                            </span>
                            <span className="journal-reminder-step">
                                <span className="journal-reminder-num">2</span> how you feel
                            </span>
                            <span className="journal-reminder-step">
                                <span className="journal-reminder-num">3</span> what's next
                            </span>
                        </div>
                        <div className="journal-popup-hint">
                            <span className="journal-popup-hint-icon">!</span>
                            If distracted — log it, then return
                        </div>
                    </div>
                )}

                <div className="entries">
                    <div className="entries-toolbar">
                        <h3 className="entries-heading">Today's thread</h3>
                        <button className="add-row-btn" onClick={addEntry}>
                            <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                            Add entry
                        </button>
                    </div>

                    {entries.length === 0 && (
                        <div className="journal-empty-state">
                            <div className="journal-plus-glyph">＋</div>
                            <h3>No entries yet today</h3>
                            <p>Log your first entry to start today's reset.</p>
                            <button className="add-btn" onClick={addEntry}>
                                <Plus size={20} strokeWidth={3} aria-hidden="true" />
                                Add entry
                            </button>
                        </div>
                    )}

                    {entries.length > 0 && (
                        <div className="entry-thread">
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
                    )}
                </div>
            </div>
        </div>
    );
}
