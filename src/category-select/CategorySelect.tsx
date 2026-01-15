import './category-select.css';

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
    onChange
}: CategorySelectProps) => (
    <div className={`category-select-wrapper ${isFilter ? 'category-select-wrapper_filter' : ''}`}>
        {!isFilter && <label htmlFor={id}>New Task Category:</label>}
        <select
            id={id}
            className={`category-select ${isFilter ? 'category-select_filter' : ''}`}
            value={selectedCategory}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">No Category</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Home">Home</option>
            <option value="Health">Health</option>
            <option value="People">People</option>
            <option value="Pets">Pets</option>
            <option value="Money">Money</option>
            <option value="Growth">Growth</option>
            <option value="Fun">Fun</option>
        </select>
    </div>
)

export default CategorySelect;
