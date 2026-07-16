import { Input, Checkbox, Field, Label } from '@headlessui/react';
import { SearchIcon, X } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import type { ChecklistItem, SearchScope } from 'src/app/types';
import { useTask } from 'src/app/use-task';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import { ALL_MODES } from 'src/checklist/constants';
import TaskContextChecklist from 'src/pages/logged-in/TaskContextChecklist';
import { TABS } from './tabs/types';
import './search.css';

interface SearchProps {
    onEditItem: (item: ChecklistItem) => void;
    sparkles?: ReactElement;
}

const Search = ({ onEditItem, sparkles }: SearchProps) => {
    const [hideSubtasks, setHideSubtasks] = useState(false);
    const [hideArchived, setHideArchived] = useState(false);
    const [searchScope, setSearchScope] = useState<SearchScope>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { items } = useTask();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const normalizedQuery = deferredSearchQuery.trim();
    const normalizedQueryLowerCase = normalizedQuery.toLocaleLowerCase();
    const searchResults = useMemo(() => {
        if (!normalizedQueryLowerCase) return [];

        return items.filter(item => {
            if (hideSubtasks && item.parentUuid) return false;
            if (hideArchived && item.isArchived) return false;

            const matchesText = item.text?.toLocaleLowerCase().includes(normalizedQueryLowerCase) ?? false;

            if (searchScope === 'text') return matchesText;

            const matchesNotes = item.note?.toLocaleLowerCase().includes(normalizedQueryLowerCase) ?? false;

            if (searchScope === 'notes') return matchesNotes;
            return matchesText || matchesNotes;
        });
    }, [hideSubtasks, hideArchived, items, normalizedQueryLowerCase, searchScope]);
    const expandedNoteItemIds = useMemo(() => new Set(
        searchResults
            .filter(item => searchScope !== 'text' &&
                item.note &&
                item.note.toLocaleLowerCase().includes(normalizedQueryLowerCase))
            .map(item => item.id)
    ), [normalizedQueryLowerCase, searchResults, searchScope]);
    const itemLookup = useMemo(
        () => new Map(items.map(item => [item.id, item])),
        [items]
    );
    const clearFilters = useCallback(() => undefined, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]');

            if (event.key === '/' && !isTyping) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <section className="search-container" aria-labelledby="search-title">
            <header className="search-header">
                <div>
                    <h2 id="search-title" className="search-title">Search tasks</h2>
                    <p className="search-description">Find a task by name or note.</p>
                </div>
                {normalizedQuery && (
                    <span className="search-result-count" aria-live="polite">
                        {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                    </span>
                )}
            </header>
            <div className="search-filters">
                <label className="search-scope-field">
                    <span className="search-scope-label">Search in</span>
                    <select
                        className="search-scope-select"
                        value={searchScope}
                        onChange={(event) => setSearchScope(event.target.value as SearchScope)}
                    >
                        <option value="all">Titles and notes</option>
                        <option value="text">Titles only</option>
                        <option value="notes">Notes only</option>
                    </select>
                </label>
                <Field className="search-filter-field">
                    <Checkbox
                        checked={hideSubtasks}
                        onChange={setHideSubtasks}
                        className={`hide-subtasks-checkbox ${hideSubtasks ? 'hide-subtasks-checkbox--checked' : ''}`}
                    >
                        <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="checkbox-icon">
                            <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Checkbox>
                    <Label className="search-filter-label">Hide subtasks</Label>
                </Field>
                <Field className="search-filter-field">
                    <Checkbox
                        checked={hideArchived}
                        onChange={setHideArchived}
                        className={`hide-archived-checkbox ${hideArchived ? 'hide-archived-checkbox--checked' : ''}`}
                    >
                        <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="checkbox-icon">
                            <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Checkbox>
                    <Label className="search-filter-label">Hide archived</Label>
                </Field>
            </div>
            <div className="search-input-wrapper">
                <SearchIcon className="search-input-icon" size={18} aria-hidden="true" />
                <Input
                    className="search-input"
                    name="search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                            setSearchQuery('');
                        }
                    }}
                    placeholder="Search tasks…"
                    aria-label="Search tasks"
                    autoComplete="off"
                    ref={inputRef}
                />
                {searchQuery && (
                    <button
                        className="search-clear-button"
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            inputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        title="Clear search"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                )}
            </div>

            {!normalizedQuery ? (
                <div className="search-empty-state">
                    <SearchIcon size={28} aria-hidden="true" />
                    <p>Start typing to search all tasks.</p>
                </div>
            ) : searchResults.length === 0 ? (
                <div className="search-empty-state" role="status">
                    <p>No tasks match “{normalizedQuery}”.</p>
                </div>
            ) : (
                <div className="search-results">
                    <TaskContextChecklist
                        items={searchResults}
                        checklistType="search-results"
                        activeTab={TABS.search}
                        modeFilter={ALL_MODES}
                        hideCompleted={false}
                        filterCategory={ALL_CATEGORIES}
                        clearFilters={clearFilters}
                        onEditItem={onEditItem}
                        expandedNoteItemIds={expandedNoteItemIds}
                        itemLookup={itemLookup}
                        sparkles={sparkles}
                        enablePullToRefresh={false}
                    />
                </div>
            )}
        </section>
    );
};

export default Search;
