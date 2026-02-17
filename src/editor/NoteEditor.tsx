import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    type MDXEditorMethods
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { useEffect } from 'react';

interface NoteEditorProps {
    initialMarkdown: string;
    ref?: React.Ref<MDXEditorMethods>;
    readOnly: boolean;
}
const NoteEditor = ({ initialMarkdown, ref, readOnly = false }: NoteEditorProps) => {

    useEffect(() => {
        if (ref && typeof ref !== 'function') {
            console.log("editorRef.current:", ref.current);
        }
    }, [ref]);

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
