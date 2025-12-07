
import { useState, useCallback, useEffect } from 'react';
import type { Category, Note, SortOption, ViewMode } from '../types/notes';
import { noteDTOToNote, noteToCreateRequest, noteToUpdateRequest } from '../types/notes';
import { notesApi, ApiError } from '../services/api';

const defaultCategories: Category[] = [
  { id: '1', name: 'Personal', color: 'personal' },
  { id: '2', name: 'Work', color: 'work' },
  { id: '3', name: 'Ideas', color: 'ideas' },
  { id: '4', name: 'Tasks', color: 'tasks' },
];

// LocalStorage keys for pinned notes
const PINNED_NOTES_KEY = 'pinnedNotes';

interface NoteCounts {
  active: number;
  archived: number;
  byCategory: Record<string, number>;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [noteCounts, setNoteCounts] = useState<NoteCounts>({
    active: 0,
    archived: 0,
    byCategory: {}
  });
  const pageSize = 12;

  // Load/Save pinned notes from localStorage
  const loadPinnedNotes = useCallback((): Set<number> => {
    try {
      const pinned = localStorage.getItem(PINNED_NOTES_KEY);
      return pinned ? new Set(JSON.parse(pinned)) : new Set();
    } catch {
      return new Set();
    }
  }, []);

  const savePinnedNotes = useCallback((pinnedIds: Set<number>) => {
    try {
      localStorage.setItem(PINNED_NOTES_KEY, JSON.stringify([...pinnedIds]));
    } catch (error) {
      console.error('Error saving pinned notes:', error);
    }
  }, []);


  const fetchNoteCounts = useCallback(async () => {
    try {
      // Fetch active notes count
      const activeResponse = await notesApi.getNotes({
        page: 0,
        size: 1,
        archived: false,
      });

      // Fetch archived notes count
      const archivedResponse = await notesApi.getNotes({
        page: 0,
        size: 1,
        archived: true,
      });

      // Fetch counts by category
      const categoryCountsPromises = categories.map(async (category) => {
        const response = await notesApi.getNotes({
          page: 0,
          size: 1,
          archived: false,
          categories: [category.name],
        });
        return { categoryId: category.id, count: response.totalElements };
      });

      const categoryCounts = await Promise.all(categoryCountsPromises);
      const byCategory: Record<string, number> = {};
      categoryCounts.forEach(({ categoryId, count }) => {
        byCategory[categoryId] = count;
      });

      setNoteCounts({
        active: activeResponse.totalElements,
        archived: archivedResponse.totalElements,
        byCategory,
      });
    } catch (err) {
      console.error('Error fetching note counts:', err);
    }
  }, [categories]);

  // Fetch notes from API
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const selectedCategories = selectedCategoryId
        ? categories.find(c => c.id === selectedCategoryId)?.name
        : undefined;

      const response = await notesApi.getNotes({
        page: currentPage,
        size: pageSize,
        sortBy: sortOption,
        archived: viewMode === 'archived',
        categories: selectedCategories ? [selectedCategories] : undefined,
        search: searchQuery || undefined,
      });

      const pinnedIds = loadPinnedNotes();
      const convertedNotes = response.content.map(dto => {
        const note = noteDTOToNote(dto);
        note.isPinned = pinnedIds.has(note.id);
        return note;
      });

      setNotes(convertedNotes);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);


      await fetchNoteCounts();
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to load notes';
      setError(errorMessage);
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortOption, viewMode, selectedCategoryId, searchQuery, categories, loadPinnedNotes, fetchNoteCounts]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchNoteCounts();
  }, [fetchNoteCounts]);

  useEffect(() => {
    setCurrentPage(0);
  }, [sortOption, viewMode, selectedCategoryId, searchQuery]);

  const addNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const request = noteToCreateRequest(noteData);
      const createdNote = await notesApi.createNote(request);
      const note = noteDTOToNote(createdNote);
      
      await fetchNotes(); 
      return note;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to create note';
      setError(errorMessage);
      console.error('Error creating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  const updateNote = useCallback(async (id: number, updates: Partial<Note>) => {
    setLoading(true);
    setError(null);
    
    try {

      const currentNote = notes.find(n => n.id === id);
      if (!currentNote) {
        throw new Error('Note not found');
      }

      const updatedData = { ...currentNote, ...updates };
      const request = noteToUpdateRequest(updatedData);
      
      await notesApi.updateNote(id, request);
      await fetchNotes(); 
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update note';
      setError(errorMessage);
      console.error('Error updating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [notes, fetchNotes]);

  const deleteNote = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await notesApi.deleteNote(id);
      
      // Remove from pinned if it was pinned
      const pinnedIds = loadPinnedNotes();
      if (pinnedIds.has(id)) {
        pinnedIds.delete(id);
        savePinnedNotes(pinnedIds);
      }
      
      await fetchNotes(); 
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to delete note';
      setError(errorMessage);
      console.error('Error deleting note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNotes, loadPinnedNotes, savePinnedNotes]);

  const toggleArchive = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await notesApi.toggleArchive(id);
      await fetchNotes(); 
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to archive note';
      setError(errorMessage);
      console.error('Error toggling archive:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  const togglePin = useCallback((id: number) => {
    const pinnedIds = loadPinnedNotes();
    
    if (pinnedIds.has(id)) {
      pinnedIds.delete(id);
    } else {
      pinnedIds.add(id);
    }
    
    savePinnedNotes(pinnedIds);
    
    // Update local state
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  }, [loadPinnedNotes, savePinnedNotes]);

  const addCategory = useCallback((name: string, color: Category['color']) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    };
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    }
  }, [selectedCategoryId]);

  const getCategoryById = useCallback(
    (id: string | null) => categories.find(cat => cat.id === id) || null,
    [categories]
  );

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return {
    notes: sortedNotes,
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
    pageSize,
    setViewMode,
    setSelectedCategoryId,
    setSearchQuery,
    setSortOption,
    setCurrentPage,
    addNote,
    updateNote,
    deleteNote,
    toggleArchive,
    togglePin,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refetch: fetchNotes,
  };
}