import { useRef } from "react";
import './tabs.css';

export const TABS = {
    priority: 'priority',
    today: 'today',
    scheduled: 'scheduled',
    hidden: 'hidden',
    archived: 'archived'
}

const tabOptions = [
    { id: TABS.priority, label: "⭐ Priority", priority: true },
    { id: TABS.today, label: "Today", priority: true },
    { id: TABS.scheduled, label: "Scheduled", priority: false },
    { id: TABS.hidden, label: "Hidden Today", priority: false },
    { id: TABS.archived, label: "Archived", priority: false },
];

type TabsProps<T extends string> = {
    value: T;
    onChange: (value: T) => void;
};

function Tabs<T extends string>({
    value,
    onChange,
}: TabsProps<T>) {
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    function onKeyDown(e: React.KeyboardEvent, index: number) {
        let nextIndex = index;

        switch (e.key) {
            case "ArrowRight":
                nextIndex = (index + 1) % tabOptions.length;
                break;
            case "ArrowLeft":
                nextIndex = (index - 1 + tabOptions.length) % tabOptions.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = tabOptions.length - 1;
                break;
            case "Enter":
            case " ":
                onChange(tabOptions[index].id as T);
                return;
            default:
                return;
        }

        e.preventDefault();
        tabRefs.current[nextIndex]?.focus();
    }

    return (
        <div className="tabs-container">
        <div className="tablist" role="tablist" aria-label="Task filters">
            {tabOptions.map((tab, index) => (
                <button
                    key={tab.id}
                    ref={(el) => { tabRefs.current[index] = el; }}
                    role="tab"
                    aria-selected={value === tab.id}
                    tabIndex={value === tab.id ? 0 : -1}
                    onClick={() => onChange(tab.id as T)}
                    onKeyDown={(e) => onKeyDown(e, index)}
                    className={`
                        tab
                        tab-${value === tab.id ? "active" : "inactive"}
                        ${tab.priority ? "tab--weighty" : ""}
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
        </div>
    );
}

export default Tabs;
