import { lazy, Suspense } from 'react';
import type { NoteEditorProps } from './NoteEditor';

const NoteEditor = lazy(() => import('./NoteEditor'));

const LazyNoteEditor = (props: NoteEditorProps) => (
    <Suspense fallback={null}>
        <NoteEditor {...props} />
    </Suspense>
);

export default LazyNoteEditor;
