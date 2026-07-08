import { CATEGORY_ICON_OPTIONS } from './category-constants';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import './IconPicker.css';

type IconPickerProps = {
    value?: string;
    label: string;
    onChange: (icon?: string) => void;
    color?: string;
};

const SelectedIconComponent = ({ value, color = '#000000' }: { value?: string, color?: string }) => {
    const SelectedIcon = CATEGORY_ICON_OPTIONS.find(option => option.key === value)?.Icon;
    if (!SelectedIcon) return null;
    return (<SelectedIcon size={16} aria-hidden="true" color={color} />);
}

function IconPicker({ value, label, onChange, color }: IconPickerProps) {
    return (
        <label className="category-settings-field">
            <span>{label}</span>
            <Listbox value={value} onChange={onChange}>
                <ListboxButton className="category-settings-icon" aria-label={label}>
                    <span className="category-settings-icon__value">
                        <span className="category-settings-icon__icon">
                            {CATEGORY_ICON_OPTIONS.find(option => option.key === value)
                                ? <SelectedIconComponent value={value} color={color} />
                                : null}
                        </span>
                        <span className="category-settings-icon-picker-label">
                            {CATEGORY_ICON_OPTIONS.find(option => option.key === value)?.label || 'None'}
                        </span>
                    </span>
                    <span className="category-settings-icon__chevron" aria-hidden="true">▾</span>
                </ListboxButton>
                <ListboxOptions anchor="bottom" className="category-settings-icon-picker-options">
                    <ListboxOption
                        title="No icon"
                        value={undefined}
                        className={({ active, selected }) => `category-settings-icon-picker-option ${active ? 'is-active' : ''} ${selected ? 'is-selected' : ''}`}
                    >
                        <span className="category-settings-icon-picker-option__content">
                            <span className="category-settings-icon-picker-option__label">None</span>
                        </span>
                    </ListboxOption>
                    {CATEGORY_ICON_OPTIONS.map(({ key, label: iconLabel, Icon }) => (
                        <ListboxOption
                            key={key}
                            title={iconLabel}
                            value={key}
                            className={({ active, selected }) => `category-settings-icon-picker-option ${active ? 'is-active' : ''} ${selected ? 'is-selected' : ''}`}
                        >
                            <span className="category-settings-icon-picker-option__content">
                                <span className="category-settings-icon-picker-option__icon"><Icon size={16} aria-hidden="true" color={color} /></span>
                                <span className="category-settings-icon-picker-option__label">{iconLabel}</span>
                            </span>
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </label>
    );
}

export default IconPicker;
