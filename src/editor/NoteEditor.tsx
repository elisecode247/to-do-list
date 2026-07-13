import {
    type MDXEditorMethods,
    BoldItalicUnderlineToggles,
    MDXEditor,
    UndoRedo,
    InsertThematicBreak,
    CodeToggle,
    CreateLink,
    DiffSourceToggleWrapper,
    diffSourcePlugin,
    headingsPlugin,
    linkDialogPlugin,
    linkPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    ListsToggle,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css';
import './note-editor.css';

interface NoteEditorProps {
    initialMarkdown: string;
    ref?: React.Ref<MDXEditorMethods>;
    readOnly: boolean;
    className?: string;
    onChange?: (markdown: string) => void;
}
const NoteEditor = ({ initialMarkdown, ref, readOnly = false, className, onChange }: NoteEditorProps) => {

    return (
        <MDXEditor
            ref={ref}
            markdown={initialMarkdown}
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                diffSourcePlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                toolbarPlugin({
                    toolbarClassName: "flex-wrap",
                    toolbarContents: () => (
                        <DiffSourceToggleWrapper
                            children={(
                                <>
                                    <UndoRedo />
                                    <BoldItalicUnderlineToggles />
                                    <ListsToggle />
                                    <InsertThematicBreak />
                                    <CreateLink />
                                    <CodeToggle />
                                </>
                            )}
                        />
                    )
                })
            ]}
            readOnly={readOnly}
            contentEditableClassName="note-editor-content"
            className={className}
            {...(onChange ? { onChange } : {})}
        />
    );
};

export default NoteEditor;
