import './category-select.css';
import { categories } from './category-constants';

interface CategorySelectProps {
    id: string;
    isFilter?: boolean;
    selectedCategory: string;
    onChange: (value: string) => void;
}

const CategorySelect = ({
    id,
    isFilter = false,
    selectedCategory,
    onChange,
}: CategorySelectProps) => {

    return (
        <div className={`category-select-wrapper ${isFilter ? 'category-select-wrapper_filter' : ''}`}>
            <select
                id={`category-select-${id}`}
                className={`select-input ${isFilter ? 'category-select_filter' : ''}`}
                value={selectedCategory}
                onChange={(e) => onChange(e.target.value)}
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
