import { useState, type FormEvent } from 'react';
import './category-settings.css';
import {
    formatCategoryOptionLabel,
    type CategoryDefinition,
} from 'src/category-select/category-constants';
import { CategoryIcon } from 'src/category-select/category-icons';
import IconPicker from 'src/category-select/IconPicker';
import { useToast } from 'src/toast/use-toast';
import { useUserSettings } from 'src/user-settings/use-user-settings';

const DEFAULT_NEW_CATEGORY_COLOR = '#14b8a6';

function CategoryPreview({ category }: { category: CategoryDefinition }) {
    return (
        <div
            className="category-preview-pill"
            style={{ "--category-preview-color": category.color } as React.CSSProperties}
        >
            <CategoryIcon iconKey={category.icon} color={category.color} />
            <span>{category.name}</span>
        </div>
    );
}

function CategorySettings() {
    const {
        categories,
        createCategory,
        updateCategory,
        setCategoryVisibility,
        deleteCategory,
    } = useUserSettings();
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [color, setColor] = useState(DEFAULT_NEW_CATEGORY_COLOR);
    const [icon, setIcon] = useState('');

    const editableCategories = categories.filter(category => !category.isDeleted);
    const builtInCategories = editableCategories.filter(category => category.isBuiltIn);
    const customCategories = editableCategories.filter(category => !category.isBuiltIn);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim()) {
            showToast('Category name is required.', 'error');
            return;
        }

        createCategory({
            name,
            color,
            icon,
        });

        setName('');
        setColor(DEFAULT_NEW_CATEGORY_COLOR);
        setIcon('');
        showToast('Category created.', 'success');
    };

    return (
        <section className="settings-section">
            <h3 className="settings-section-title">Categories</h3>
            <p className="category-settings-description">
                Rename the built-ins, hide categories you do not want to see, and add unlimited custom categories.
                Tasks keep the category ID, so renaming never changes stored task data.
            </p>

            <div className="category-settings-container">
                {builtInCategories.map(category => (
                    <article key={category.id} className="category-settings-card">
                        <div className="category-settings-card__header">
                            <CategoryPreview category={category} />
                            <span className="category-settings-card__badge">Built-in</span>
                        </div>

                        <label className="category-settings-field">
                            <span>Name</span>
                            <input
                                className="task-form-input"
                                value={category.name}
                                onChange={(event) => updateCategory(category.id, { name: event.target.value })}
                            />
                        </label>

                        <div className="category-settings-row">
                            <label className="category-settings-field">
                                <span>Color</span>
                                <input
                                    className="category-settings-color"
                                    type="color"
                                    value={category.color}
                                    onChange={(event) => updateCategory(category.id, { color: event.target.value })}
                                    aria-label={`Choose a color for ${category.name}`}
                                />
                            </label>

                            <IconPicker
                                label="Icon"
                                value={category.icon}
                                onChange={(nextIcon) => updateCategory(category.id, { icon: nextIcon })}
                            />
                        </div>

                        <label className="category-settings-toggle">
                            <input
                                type="checkbox"
                                checked={category.isVisible}
                                onChange={(event) => setCategoryVisibility(category.id, event.target.checked)}
                            />
                            <span>Show in category lists</span>
                        </label>
                    </article>
                ))}
            </div>

            <div className="category-settings-divider" />

            <div className="category-settings-section-header">
                <div>
                    <h4 className="category-settings-subtitle">Custom Categories</h4>
                    <p className="category-settings-help">
                        Custom categories can be renamed, recolored, hidden, and removed without changing task IDs.
                    </p>
                </div>
            </div>

            <form className="category-settings-create" onSubmit={handleSubmit}>
                <label className="category-settings-field">
                    <span>Name</span>
                    <input
                        className="task-form-input"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Add a category"
                    />
                </label>

                <label className="category-settings-field">
                    <span>Color</span>
                    <input
                        className="category-settings-color"
                        type="color"
                        value={color}
                        onChange={(event) => setColor(event.target.value)}
                        aria-label="Choose a color for the new category"
                    />
                </label>

                <IconPicker
                    label="Icon"
                    value={icon || undefined}
                    onChange={(nextIcon) => setIcon(nextIcon ?? '')}
                />

                <button
                    className="settings-btn settings-btn--primary custom-category-submit-btn"
                    type="submit"
                >
                    Add Category
                </button>
            </form>

            <div className="category-settings-container">
                {customCategories.length === 0 ? (
                    <div className="category-settings-empty">No custom categories yet.</div>
                ) : customCategories.map(category => (
                    <article key={category.id} className="category-settings-card">
                        <div className="category-settings-card__header">
                            <CategoryPreview category={category} />
                            <span className="category-settings-card__badge category-settings-card__badge--custom">
                                Custom
                            </span>
                        </div>

                        <label className="category-settings-field">
                            <span>Name</span>
                            <input
                                className="task-form-input"
                                value={category.name}
                                onChange={(event) => updateCategory(category.id, { name: event.target.value })}
                            />
                        </label>

                        <div className="category-settings-row">
                            <label className="category-settings-field">
                                <span>Color</span>
                                <input
                                    className="category-settings-color"
                                    type="color"
                                    value={category.color}
                                    onChange={(event) => updateCategory(category.id, { color: event.target.value })}
                                    aria-label={`Choose a color for ${category.name}`}
                                />
                            </label>

                            <IconPicker
                                label="Icon"
                                value={category.icon}
                                onChange={(nextIcon) => updateCategory(category.id, { icon: nextIcon })}
                            />
                        </div>

                        <div className="category-settings-actions">
                            <label className="category-settings-toggle">
                                <input
                                    type="checkbox"
                                    checked={category.isVisible}
                                    onChange={(event) => setCategoryVisibility(category.id, event.target.checked)}
                                />
                                <span>Show in category lists</span>
                            </label>

                            <button
                                className="settings-btn"
                                type="button"
                                onClick={() => {
                                    deleteCategory(category.id);
                                    showToast(`${formatCategoryOptionLabel(category)} removed.`, 'success');
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default CategorySettings;
