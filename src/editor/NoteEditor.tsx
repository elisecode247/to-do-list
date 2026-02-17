import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    type MDXEditorMethods
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

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
        />
    );
};

export default NoteEditor;
