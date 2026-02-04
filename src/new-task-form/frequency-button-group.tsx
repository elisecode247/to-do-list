import './frequency-button-group.css';
import { EXCLUSIVE_TAGS, type Tag } from 'checklist/constants';
import { getTagColor } from 'checklist/utilities/get-tag-color';

interface FrequencyButtonGroupProps {
    newTaskTags: Tag[];
    onClick: (tag: Tag) => void;
}

function FrequencyButtonGroup({ newTaskTags, onClick }: FrequencyButtonGroupProps) {
    const handleSelect = (frequency: Tag) => {
        onClick(frequency);
    };

    return (
        <div className="frequency-selector__group-wrapper">
            <label>New Task Frequency:</label>
            <div className="frequency-selector__button-group">
                {EXCLUSIVE_TAGS.map((frequency) => (
                    <button
                        key={frequency}
                        onClick={() => handleSelect(frequency)}
                        className={`frequency-selector__button
                            ${newTaskTags.includes(frequency)
                                ? `frequency-selector__button--active
                                    ${getTagColor(frequency)}`
                                : ''
                            }`}
                    >
                        {frequency}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default FrequencyButtonGroup;
