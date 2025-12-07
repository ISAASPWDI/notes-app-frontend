
import { useState, useEffect } from 'react';
import { Pin, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import type { Note, Category } from '../../types/notes';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { cn } from '../../lib/utils';

interface NoteModalProps {
  isOpen: boolean;
  note: Note | null;
  categories: Category[];
  onClose: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived'>) => void;
  onUpdate: (id: number, updates: Partial<Note>) => void;
  onTogglePin: (id: number) => void;
  onToggleArchive: (id: number) => void;
  onDelete: (id: number) => void;
}

const categoryColorMap: Record<Category['color'], string> = {
  personal: 'bg-category-personal',
  work: 'bg-category-work',
  ideas: 'bg-category-ideas',
  tasks: 'bg-category-tasks',
};

export function NoteModal({
  isOpen,
  note,
  categories,
  onClose,
  onSave,
  onUpdate,
  onTogglePin,
  onToggleArchive,
  onDelete,
}: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedCategories(note.categories || []);
    } else {
      setTitle('');
      setContent('');
      setSelectedCategories([]);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;

    if (isEditing && note) {
      onUpdate(note.id, { 
        title, 
        content, 
        categories: selectedCategories 
      });
    } else {
      onSave({
        title,
        content,
        categories: selectedCategories,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (note && confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
      onClose();
    }
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">
                {isEditing ? 'Edit Note' : 'New Note'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Make changes to your note'
                  : 'Create a new note with title and content'}
              </DialogDescription>
            </div>

            {isEditing && note && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTogglePin(note.id)}
                  className={cn('h-8 w-8', note.isPinned && 'text-accent')}
                >
                  <Pin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onToggleArchive(note.id);
                    onClose();
                  }}
                  className="h-8 w-8"
                >
                  {note.isArchived ? (
                    <ArchiveRestore className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <Input
            placeholder="Note title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-lg font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />


          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2',
                    selectedCategories.includes(category.name)
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  <span
                    className={cn('w-2 h-2 rounded-full', categoryColorMap[category.color])}
                  />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[200px] resize-none border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border bg-secondary/30">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={!title.trim()}
          >
            {isEditing ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}