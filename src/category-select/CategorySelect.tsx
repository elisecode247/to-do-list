import './category-select.css';
import { getCategoryOptions } from './category-constants';
import { useFormContext } from 'react-hook-form';
import type { CategoryDefinition } from './types';
interface CategorySelectProps {
    id: string;
    isFilter?: boolean;
    selectedCategory?: string;
    onChange?: (value: string) => void;
    categories: CategoryDefinition[];
    disabled?: boolean;
    ariaDescribedBy?: string;
}

const CategorySelect = ({
    id,
    isFilter = false,
    selectedCategory,
    onChange,
    categories,
    disabled = false,
    ariaDescribedBy,
}: CategorySelectProps) => {
    const methods = useFormContext();
    const registration = methods?.register
        ? methods.register('category', { required: true })
        : undefined;
    const categoryOptions = getCategoryOptions(categories, {
        includeAll: isFilter,
        includeNone: true,
        includeId: selectedCategory,
    });

    return (
        <div className={`category-select-wrapper ${isFilter ? 'category-select-wrapper_filter' : ''}`}>
            <select
                name="category"
                {...registration}
                id={`category-select-${id}`}
                className={`select-input ${isFilter ? 'category-select_filter' : ''}`}
                disabled={disabled}
                aria-describedby={ariaDescribedBy}
                {...(selectedCategory !== undefined ? { value: selectedCategory } : {})}
                onChange={(event) => {
                    registration?.onChange(event);
                    onChange?.(event.target.value);
                }}
            >
                {categoryOptions.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
        </div>
    )
};

export default CategorySelect;
