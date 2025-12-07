import { Pin, Archive, ArchiveRestore, Trash2, MoreHorizontal } from 'lucide-react';
import type { Note, Category } from '../../types/notes';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { format } from 'date-fns';

interface NoteCardProps {
  note: Note;
  getCategoryByName: (name: string) => Category | null;
  onEdit: (note: Note) => void;
  onTogglePin: (id: number) => void;
  onToggleArchive: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const categoryColorMap: Record<Category['color'], string> = {
  personal: 'bg-category-personal',
  work: 'bg-category-work',
  ideas: 'bg-category-ideas',
  tasks: 'bg-category-tasks',
};

export function NoteCard({
  note,
  getCategoryByName,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: NoteCardProps) {
  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onToggleArchive(note.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      await onDelete(note.id);
    }
  };

  return (
    <div
      onClick={() => onEdit(note)}
      className={cn(
        'group relative bg-card rounded-xl p-5 cursor-pointer transition-all duration-300',
        'note-shadow hover:note-shadow-hover hover:-translate-y-0.5',
        'border border-transparent hover:border-border',
        note.isPinned && 'ring-2 ring-accent/30'
      )}
    >
      {note.isPinned && (
        <div className="absolute -top-1.5 -right-1.5">
          <div className="bg-accent text-accent-foreground p-1 rounded-full shadow-md">
            <Pin className="h-3 w-3" />
          </div>
        </div>
      )}


      {note.categories && note.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {note.categories.slice(0, 2).map((categoryName, index) => {
            const category = getCategoryByName(categoryName);
            return (
              <div key={index} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    category?.color ? categoryColorMap[category.color] : 'bg-gray-400'
                  )}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {categoryName}
                </span>
              </div>
            );
          })}
          {note.categories.length > 2 && (
            <span className="text-xs font-medium text-muted-foreground">
              +{note.categories.length - 2} more
            </span>
          )}
        </div>
      )}

      <h3 className="font-semibold text-foreground line-clamp-2 mb-2 leading-snug">
        {note.title || 'Untitled'}
      </h3>

      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
        {note.content || 'No content'}
      </p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          {format(note.updatedAt, 'MMM d, yyyy')}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={e => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-secondary"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={e => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
            >
              <Pin className="h-4 w-4 mr-2" />
              {note.isPinned ? 'Unpin' : 'Pin'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleArchive}>
              {note.isArchived ? (
                <>
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}