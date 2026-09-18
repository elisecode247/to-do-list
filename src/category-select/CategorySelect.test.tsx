// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { click, renderUi, type RenderedUi } from 'src/test/render-ui';
import CategorySelect from './CategorySelect';
import { NO_CATEGORY_ID } from './category-constants';

type FormValues = {
    category: string;
};

let rendered: RenderedUi | undefined;

afterEach(async () => {
    await rendered?.unmount();
    rendered = undefined;
});

describe('CategorySelect', () => {
    it('allows No Category to be the default for an optional category field', async () => {
        const onSubmit = vi.fn();

        function OptionalCategoryForm() {
            const methods = useForm<FormValues>({
                defaultValues: { category: NO_CATEGORY_ID },
            });

            return (
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <CategorySelect
                            id="new-task"
                            categories={[{
                                id: 'work',
                                name: 'Work',
                                color: '#4ade80',
                                isVisible: true,
                                isBuiltIn: true,
                            }]}
                            isRequired={false}
                        />
                        <button type="submit">Save</button>
                    </form>
                </FormProvider>
            );
        }

        rendered = await renderUi(<OptionalCategoryForm />);
        const select = rendered.container.querySelector('select') as HTMLSelectElement;

        expect(select.value).toBe(NO_CATEGORY_ID);
        expect(select.selectedOptions[0]?.textContent).toBe('No Category');

        await click(rendered.container.querySelector('button')!);

        expect(onSubmit).toHaveBeenCalledWith(
            { category: NO_CATEGORY_ID },
            expect.anything(),
        );
    });
});
