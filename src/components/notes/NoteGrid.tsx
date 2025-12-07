import type { Note, Category } from '../../types/notes';
import { NoteCard } from './NoteCard';
import { FileText, Archive } from 'lucide-react';

interface NoteGridProps {
  notes: Note[];
  getCategoryByName: (name: string) => Category | null;
  isArchiveView: boolean;
  onEditNote: (note: Note) => void;
  onTogglePin: (id: number) => void;
  onToggleArchive: (id: number) => Promise<void>;
  onDeleteNote: (id: number) => Promise<void>;
}

export function NoteGrid({
  notes,
  getCategoryByName,
  isArchiveView,
  onEditNote,
  onTogglePin,
  onToggleArchive,
  onDeleteNote,
}: NoteGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          {isArchiveView ? (
            <Archive className="h-8 w-8 text-muted-foreground" />
          ) : (
            <FileText className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {isArchiveView ? 'No archived notes' : 'No notes yet'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {isArchiveView
            ? 'Notes you archive will appear here for safekeeping.'
            : 'Create your first note to start organizing your thoughts and ideas.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note, index) => (
        <div
          key={note.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <NoteCard
            note={note}
            getCategoryByName={getCategoryByName}
            onEdit={onEditNote}
            onTogglePin={onTogglePin}
            onToggleArchive={onToggleArchive}
            onDelete={onDeleteNote}
          />
        </div>
      ))}
    </div>
  );
}