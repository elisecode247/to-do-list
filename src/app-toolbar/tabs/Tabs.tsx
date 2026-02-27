import { useRef, useState, useEffect } from "react";
import './tabs.css';
import { TABS } from "./types";

const tabOptions = [
    { id: TABS.priority, label: "⭐ Priority", priority: true },
    { id: TABS.today, label: "Today", priority: true },
    { id: TABS.upcoming, label: "Upcoming", priority: true },
    { id: TABS.hidden, label: "Not Today", priority: false },
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
    const tabListRef = useRef<HTMLDivElement | null>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [isWrapped, setIsWrapped] = useState(false);

    useEffect(() => {
        function checkWrap() {
            const el = tabListRef.current;
            if (!el) return;

            const firstTop = el.children[0]?.getBoundingClientRect().top;
            const lastTop = el.children[el.children.length - 1]?.getBoundingClientRect().top;

            const wrapped = firstTop > lastTop;
            setIsWrapped(wrapped);
        }

        checkWrap();

        const resizeObserver = new ResizeObserver(checkWrap);
        if (tabListRef.current) {
            resizeObserver.observe(tabListRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);


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
            <div
                ref={tabListRef}
                className={`tablist ${isWrapped ? "tablist--wrapped" : ""}`}
                role="tablist"
                aria-label="Task filters"
            >
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
