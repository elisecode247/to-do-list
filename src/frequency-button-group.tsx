import './frequency-button-group.css'; // TODO update absolute path
import { TAGS, type Tag } from 'checklist/constants';
import { getTagColor } from 'checklist/utilities/get-tag-color';

interface FrequencyButtonGroupProps {
    newTaskTags: Tag[];
    onClick: (tag: Tag) => void;
}

function FrequencyButtonGroup({ newTaskTags, onClick }: FrequencyButtonGroupProps) {
    const handleSelect = (frequency: string) => {
        onClick(frequency);
    };

    return (
        <div className="frequency-selector__group-wrapper">
            <label>New Task Frequency:</label>
            <div className="frequency-selector__button-group">
                {TAGS.map((frequency) => (
                    <button
                        key={frequency}
                        onClick={() => handleSelect(frequency)}
                        className={`frequency-selector__button
                            ${newTaskTags.includes(frequency)
                                ? 'frequency-selector__button--active'
                                : ''
                            }
                            ${getTagColor(frequency)} hover:opacity-80`}
                    >
                        {frequency}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default FrequencyButtonGroup;
