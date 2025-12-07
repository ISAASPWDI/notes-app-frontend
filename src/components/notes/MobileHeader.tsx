import { Menu, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../../components/ui/sheet';
import { AppSidebar } from './AppSidebar';
import type { Category, ViewMode } from '../../types/notes';

interface NoteCounts {
  active: number;
  archived: number;
  byCategory: Record<string, number>;
}
interface MobileHeaderProps {
  viewMode: ViewMode;
  selectedCategoryId: string | null;
  categories: Category[];
  noteCounts: NoteCounts;
  onViewModeChange: (mode: ViewMode) => void;
  onCategorySelect: (categoryId: string | null) => void;
  onManageCategories: () => void;
  onNewNote: () => void;
}

export function MobileHeader({
  viewMode,
  selectedCategoryId,
  categories,
  noteCounts,
  onViewModeChange,
  onCategorySelect,
  onManageCategories,
  onNewNote,
}: MobileHeaderProps) {
  return (
    <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-40">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <AppSidebar
            viewMode={viewMode}
            selectedCategoryId={selectedCategoryId}
            categories={categories}
            noteCounts={noteCounts}
            onViewModeChange={onViewModeChange}
            onCategorySelect={onCategorySelect}
            onManageCategories={onManageCategories}
            onNewNote={onNewNote}
          />
        </SheetContent>
      </Sheet>

      <h1 className="text-lg font-semibold">Notes</h1>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNewNote}
        className="text-accent"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </header>
  );
}
