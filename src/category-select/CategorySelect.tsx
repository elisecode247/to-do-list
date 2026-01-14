import './category-select.css';

interface CategorySelectProps {
    newTaskCategory: string;
    onChange: (value: string) => void;
}

const CategorySelect = ({
    newTaskCategory,
    onChange
}: CategorySelectProps) => (
    <div className="category-select-wrapper">
        <label htmlFor="categorySelect">New Task Category:</label>
        <select
            id="categorySelect"
            className="category-select"
            value={newTaskCategory}
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
