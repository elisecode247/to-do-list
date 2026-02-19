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
}
const NoteEditor = ({ initialMarkdown, ref, readOnly = false }: NoteEditorProps) => {

    return (
        <MDXEditor
            ref={ref}
            markdown={initialMarkdown}
            plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin()]}
            readOnly={readOnly}
            contentEditableClassName="note-editor-content"
        />
    );
};

export default NoteEditor;
