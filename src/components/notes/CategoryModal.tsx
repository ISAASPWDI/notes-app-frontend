import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import type { Category } from '../../types/notes';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { cn } from '../../lib/utils';

interface CategoryModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onAddCategory: (name: string, color: Category['color']) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

const colorOptions: { value: Category['color']; label: string; class: string }[] = [
  { value: 'personal', label: 'Amber', class: 'bg-category-personal' },
  { value: 'work', label: 'Blue', class: 'bg-category-work' },
  { value: 'ideas', label: 'Purple', class: 'bg-category-ideas' },
  { value: 'tasks', label: 'Green', class: 'bg-category-tasks' }
];

export function CategoryModal({
  isOpen,
  categories,
  onClose,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<Category['color']>('personal');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor('personal');
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const saveEditing = () => {
    if (editingId && editingName.trim()) {
      onUpdateCategory(editingId, { name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Create, edit, and organize your note categories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="New category name"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                className="flex-1"
              />
              <Button onClick={handleAddCategory} size="icon" className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Color:</span>
              <div className="grid grid-cols-8 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setNewCategoryColor(color.value)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-all',
                      color.class,
                      newCategoryColor === color.value
                        ? 'ring-2 ring-offset-2 ring-foreground'
                        : 'hover:scale-110'
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Existing Categories</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <span
                    className={cn(
                      'w-3 h-3 rounded-full shrink-0',
                      colorOptions.find(c => c.value === category.color)?.class
                    )}
                  />
                  
                  {editingId === category.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveEditing();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                        className="h-8 text-sm"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={saveEditing}
                        className="h-7 w-7 text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEditing}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium">{category.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(category)}
                        className="h-7 w-7 opacity-60 hover:opacity-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteCategory(category.id)}
                        className="h-7 w-7 opacity-60 hover:opacity-100 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No categories yet. Create one above!
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}