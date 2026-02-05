import './category-select.css';
import { categories } from './category-constants';

interface CategorySelectProps {
    id: string;
    isFilter?: boolean;
    selectedCategory: string;
    onChange: (value: string) => void;
    theme?: 'light' | 'dark';
}

const CategorySelect = ({
    id,
    isFilter = false,
    selectedCategory,
    onChange,
    theme = 'light'
}: CategorySelectProps) => {

    return (
        <div className={`category-select-wrapper ${isFilter ? 'category-select-wrapper_filter' : ''}
            ${theme === 'light' ? " category-select-wrapper--light " : " category-select-wrapper--dark "}`}>
            {!isFilter && <label htmlFor={id}>New Task Category:</label>}
            <select
                id={id}
                className={`category-select ${isFilter ? 'category-select_filter' : ''}
                ${theme === 'light' ? " category-select_filter--light " : " category-select_filter--dark "}`}
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
