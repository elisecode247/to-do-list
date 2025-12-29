import { useState, useEffect, useEffectEvent, type FC } from 'react';
import { FolderArchive } from 'lucide-react';
import 'app/app.css';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist.tsx';
import { fetchTasks, updateTask } from 'app/api';
import { isDateToday } from 'src/utilities/is-date-today';

const App: FC = () => {
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isActiveList, setActiveChecklist] = useState(true);
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [activeFilter, setActiveFilter] = useState('daily');

    const filteredList = isActiveList ? items.filter(item => !item.isArchived) :
        items.filter(item => item.isArchived)
    const updateActiveItems = useEffectEvent(setItems);
    useEffect(() => {
        fetchTasks().then((data) => {
            const formattedItems = data.map((item: ChecklistItem) => {
                return {
                    ...item,
                    done: isDateToday(item.lastCompleted)
                }
            })
            setItems(formattedItems);
        }).catch(e => {
            console.error(e);
            updateActiveItems([]);
        })
    }, [])

    const handleSave = () => {
        if (!editingItem) return;
        setItems(prev => {
            return prev.map(item => item.id === editingItem.id ? editingItem : item);
        });
        updateTask(editingItem).then((data) => {
            console.log(data);
        }).catch((e) => {
            alert('Task was not updated:' + e);
            console.error(e);
        });
        setEditingItem(null);
    }

    function toggleChecklist() {
        setActiveChecklist(prev => {
            // show all tasks in archived list
            if (prev) {
                setActiveFilter('')
            } else {
                setActiveFilter('daily')
            }
            return!prev;
        });
        setEditingItem(null);
    }

    return (
        <>
            {editingItem ? (
                <ItemModal
                    formData={editingItem}
                    setEditingItem={setEditingItem}
                    onSave={handleSave}
                    onClose={() => setEditingItem(null)}
                />
            ) : null}
            <div className="app_container">
                <header>
                    <h1 >My To Do List</h1>
                    <div className="header_button-group">
                        {isActiveList ? (
                            <button
                                id="see-archived-data"
                                className="see-archived-checklist-button"
                                disabled={!!editingItem}
                                onClick={toggleChecklist}
                                title="See Archived Items"
                            >
                                <FolderArchive size={12} />
                                <span>&nbsp; See Archived Checklist</span>
                            </button>
                        ) : (
                            <button
                                id="see-active-checklist"
                                className="see-active-checklist-button"
                                onClick={toggleChecklist}
                                title="See Active Checklist"
                                disabled={!!editingItem}
                            >
                                <FolderArchive size={12} />
                                <span>&nbsp; See Active Checklist</span>
                            </button>
                        )}
                    </div>
                </header>
                <main className="checklist">
                    <Checklist
                        items={filteredList}
                        isActiveList={isActiveList}
                        setItems={setItems}
                        setEditingItem={setEditingItem}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                    />
                </main>
            </div>
        </>
    );
};

export default App;
