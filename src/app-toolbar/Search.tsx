import { Input } from '@headlessui/react';
import { SearchIcon, X } from 'lucide-react';
import { useEffect, useRef, type ReactElement } from 'react';
import type { ChecklistItem } from 'src/app/types';
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
    const { searchQuery, setSearchQuery, getSearchResults } = useTask();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const normalizedQuery = searchQuery.trim();
    const searchResults = getSearchResults();

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
                    <p className="search-description">Find a task by name.</p>
                </div>
                {normalizedQuery && (
                    <span className="search-result-count" aria-live="polite">
                        {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                    </span>
                )}
            </header>

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
                        clearFilters={() => undefined}
                        onEditItem={onEditItem}
                        sparkles={sparkles}
                        enablePullToRefresh={false}
                    />
                </div>
            )}
        </section>
    );
};

export default Search;
