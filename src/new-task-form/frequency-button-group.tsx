import './frequency-button-group.css';
import { MODES } from 'checklist/constants';
import { getModeColor } from 'src/checklist/utilities/get-mode-color';
import type { Mode } from 'src/app/types';
import { useRef } from 'react';

interface FrequencyButtonGroupProps {
    mode: Mode;
    onClick: (mode: Mode) => void;
}

function FrequencyButtonGroup({ mode, onClick }: FrequencyButtonGroupProps) {
    const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

    const handleSelect = (modeOption: Mode, index: number, event?: React.MouseEvent) => {
        event?.preventDefault();
        onClick(modeOption);
        buttonsRef.current[index]?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        let nextIndex = index;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextIndex = (index + 1) % MODES.length;
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            nextIndex = (index - 1 + MODES.length) % MODES.length;
        }

        if (nextIndex !== index) {
            const nextMode = MODES[nextIndex];
            onClick(nextMode);
            buttonsRef.current[nextIndex]?.focus();
        }
    };

    return (
        <div className="frequency-selector__group-wrapper">
            <div
                className="frequency-selector__button-group"
                role="radiogroup"
                aria-label="Frequency"
            >
                {MODES.map((modeOption, index) => {
                    const isSelected = mode === modeOption;

                    return (
                        <button
                            key={modeOption}
                            ref={(el) => {buttonsRef.current[index] = el;}}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={(e) => handleSelect(modeOption, index, e)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`frequency-selector__button
                                ${isSelected
                                    ? `frequency-selector__button--active ${getModeColor(modeOption)}`
                                    : ''
                                }`}
                        >
                            {modeOption}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default FrequencyButtonGroup;
