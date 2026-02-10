import './frequency-button-group.css';
import { MODES } from 'checklist/constants';
import { getModeColor } from 'src/checklist/utilities/get-mode-color';
import type { Mode } from 'src/app/types';

interface FrequencyButtonGroupProps {
    mode: Mode;
    onClick: (mode: Mode) => void;
}

function FrequencyButtonGroup({ mode, onClick }: FrequencyButtonGroupProps) {
    const handleSelect = (mode: Mode) => {
        onClick(mode);
    };

    return (
        <div className="frequency-selector__group-wrapper">
            <label>New Task Frequency:</label>
            <div className="frequency-selector__button-group">
                {MODES.map((modeOption) => (
                    <button
                        key={modeOption}
                        onClick={() => handleSelect(modeOption)}
                        className={`frequency-selector__button
                            ${mode === modeOption
                                ? `frequency-selector__button--active
                                    ${getModeColor(modeOption)}`
                                : ''
                            }`}
                    >
                        {modeOption}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default FrequencyButtonGroup;
