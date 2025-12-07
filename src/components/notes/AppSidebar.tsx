import { FileText, Archive, Tag, Plus, Settings, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';
import { useState } from 'react';
import type { Category, ViewMode } from '../../types/notes';
import { cn } from '../../lib/utils';

interface NoteCounts {
  active: number;
  archived: number;
  byCategory: Record<string, number>;
}

interface AppSidebarProps {
  viewMode: ViewMode;
  selectedCategoryId: string | null;
  categories: Category[];
  noteCounts: NoteCounts;
  onViewModeChange: (mode: ViewMode) => void;
  onCategorySelect: (categoryId: string | null) => void;
  onManageCategories: () => void;
  onNewNote: () => void;
}

const categoryColorMap: Record<Category['color'], string> = {
  personal: 'bg-category-personal',
  work: 'bg-category-work',
  ideas: 'bg-category-ideas',
  tasks: 'bg-category-tasks',
};

export function AppSidebar({
  viewMode,
  selectedCategoryId,
  categories,
  noteCounts,
  onViewModeChange,
  onCategorySelect,
  onManageCategories,
  onNewNote,
}: AppSidebarProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col border-r border-sidebar-border sticky top-0">
      <div className="p-6 pb-4">
        <h1 className="text-xl font-semibold text-sidebar-primary tracking-tight">
          Notes
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Organize your thoughts</p>
      </div>
      <div className="px-4 mb-4">
        <Button
          onClick={onNewNote}
          className="w-full justify-start gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          <button
            onClick={() => {
              onViewModeChange('active');
              onCategorySelect(null);
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              viewMode === 'active' && !selectedCategoryId
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
            <span>All Notes</span>
            <span className="ml-auto text-xs opacity-60">{noteCounts.active}</span>
          </button>

          <button
            onClick={() => {
              onViewModeChange('archived');
              onCategorySelect(null);
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              viewMode === 'archived'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            )}
          >
            <Archive className="h-4 w-4" />
            <span>Archived</span>
            <span className="ml-auto text-xs opacity-60">{noteCounts.archived}</span>
          </button>
        </div>

        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200">
              <Tag className="h-4 w-4" />
              <span>Categories</span>
              <ChevronDown
                className={cn(
                  'ml-auto h-4 w-4 transition-transform duration-200',
                  categoriesOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {categories.map(category => {
              const count = noteCounts.byCategory[category.id] || 0;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onViewModeChange('active');
                    onCategorySelect(category.id);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-sm transition-all duration-200',
                    selectedCategoryId === category.id && viewMode === 'active'
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      categoryColorMap[category.color]
                    )}
                  />
                  <span className="flex-1 text-left">{category.name}</span>
                  <span className="text-xs opacity-60">{count}</span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onManageCategories}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
          <span>Manage Categories</span>
        </button>
      </div>
    </aside>
  );
}