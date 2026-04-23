import './category-select.css';
import { categories } from './category-constants';
import { useFormContext } from 'react-hook-form';

interface CategorySelectProps {
    id: string;
    isFilter?: boolean;
    selectedCategory?: string;
    onChange?: (value: string) => void;
}

const CategorySelect = ({
    id,
    isFilter = false,
    selectedCategory,
    onChange,
}: CategorySelectProps) => {
    const methods = useFormContext();
    const registration = methods?.register
        ? methods.register('category', { required: true })
        : undefined;

    return (
        <div className={`category-select-wrapper ${isFilter ? 'category-select-wrapper_filter' : ''}`}>
            <select
                name="category"
                {...registration}
                id={`category-select-${id}`}
                className={`select-input ${isFilter ? 'category-select_filter' : ''}`}
                {...(selectedCategory !== undefined ? { value: selectedCategory } : {})}
                onChange={(event) => {
                    registration?.onChange(event);
                    onChange?.(event.target.value);
                }}
            >
                {isFilter && <option value="all">All Category</option>}
                {Object.entries(categories).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
        </div>
    )
};

export default CategorySelect;
