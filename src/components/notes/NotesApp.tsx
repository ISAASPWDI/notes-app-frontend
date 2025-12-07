import { useState } from 'react';
import { useNotes } from '../../hooks/useNotes';

import { AppSidebar } from './AppSidebar';
import { MobileHeader } from './MobileHeader';
import { SearchBar } from './SearchBar';
import { NoteGrid } from './NoteGrid';
import { NoteModal } from './NoteModal';
import { CategoryModal } from './CategoryModal';
import type { Note } from '../../types/notes';

export function NotesApp() {
  const {
    notes,
    categories,
    viewMode,
    selectedCategoryId,
    searchQuery,
    sortOption,
    noteCounts,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    setCurrentPage,
    setViewMode,
    setSelectedCategoryId,
    setSearchQuery,
    setSortOption,
    addNote,
    updateNote,
    deleteNote,
    toggleArchive,
    togglePin,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  } = useNotes();

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleNewNote = () => {
    setEditingNote(null);
    setNoteModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived'>) => {
    try {
      await addNote(noteData);
      setNoteModalOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleUpdateNote = async (id: number, updates: Partial<Note>) => {
    try {
      await updateNote(id, updates);
      setNoteModalOpen(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNote(id);
      setNoteModalOpen(false);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleToggleArchive = async (id: number) => {
    try {
      await toggleArchive(id);
      setNoteModalOpen(false);
    } catch (error) {
      console.error('Error archiving note:', error);
    }
  };

  const getCategoryByName = (name: string) => {
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  };

  const getViewTitle = () => {
    if (viewMode === 'archived') return 'Archived Notes';
    if (selectedCategoryId) {
      const category = getCategoryById(selectedCategoryId);
      return category ? category.name : 'All Notes';
    }
    return 'All Notes';
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:block">
        <AppSidebar
          viewMode={viewMode}
          selectedCategoryId={selectedCategoryId}
          categories={categories}
          noteCounts={noteCounts}
          onViewModeChange={setViewMode}
          onCategorySelect={setSelectedCategoryId}
          onManageCategories={() => setCategoryModalOpen(true)}
          onNewNote={handleNewNote}
        />
      </div>
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileHeader
          viewMode={viewMode}
          selectedCategoryId={selectedCategoryId}
          categories={categories}
          noteCounts={noteCounts}
          onViewModeChange={setViewMode}
          onCategorySelect={setSelectedCategoryId}
          onManageCategories={() => setCategoryModalOpen(true)}
          onNewNote={handleNewNote}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {getViewTitle()}
            </h2>
            <p className="text-sm text-muted-foreground">
              {totalElements} {totalElements === 1 ? 'note' : 'notes'}
            </p>
          </div>

          <div className="mb-6">
            <SearchBar
              searchQuery={searchQuery}
              sortOption={sortOption}
              onSearchChange={setSearchQuery}
              onSortChange={setSortOption}
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {loading && notes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <NoteGrid
                notes={notes}
                getCategoryByName={getCategoryByName}
                isArchiveView={viewMode === 'archived'}
                onEditNote={handleEditNote}
                onTogglePin={togglePin}
                onToggleArchive={toggleArchive}
                onDeleteNote={deleteNote}
              />

              {/* Pagination - It only appears when there is more than one page */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0 || loading}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1 || loading}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <NoteModal
        isOpen={noteModalOpen}
        note={editingNote}
        categories={categories}
        onClose={() => setNoteModalOpen(false)}
        onSave={handleSaveNote}
        onUpdate={handleUpdateNote}
        onTogglePin={togglePin}
        onToggleArchive={handleToggleArchive}
        onDelete={handleDeleteNote}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        categories={categories}
        onClose={() => setCategoryModalOpen(false)}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  );
}