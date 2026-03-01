import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    type MDXEditorMethods
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
            plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin()]}
            readOnly={readOnly}
            contentEditableClassName="note-editor-content"
            className={className}
            {...(onChange ? { onChange } : {})}
        />
    );
};

export default NoteEditor;
