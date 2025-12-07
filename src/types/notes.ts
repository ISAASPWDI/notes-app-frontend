// API Response Types
export interface NoteDTO {
  id: number;
  title: string;
  content: string;
  categories: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// Frontend Types
export interface Note {
  id: number;
  title: string;
  content: string;
  categories: string[];
  isArchived: boolean;
  isPinned: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: 'personal' | 'work' | 'ideas' | 'tasks';
}

export interface NoteCounts {
  active: number;
  archived: number;
  byCategory: Record<string, number>;
}


export type ViewMode = 'active' | 'archived';
export type SortOption = 'newest' | 'oldest' | 'title' | 'updated';

// API Request Types
export interface CreateNoteRequest {
  title: string;
  content: string;
  categories: string[];
}

export interface UpdateNoteRequest {
  title: string;
  content: string;
  categories: string[];
}

export interface AddCategoriesRequest {
  categories: string[];
}

// Utility type conversions
export function noteDTOToNote(dto: NoteDTO): Note {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    categories: dto.categories || [],
    isArchived: dto.isArchived,
    isPinned: false, 
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function noteToCreateRequest(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isPinned' | 'isArchived'>): CreateNoteRequest {
  return {
    title: note.title,
    content: note.content,
    categories: note.categories,
  };
}

export function noteToUpdateRequest(note: Partial<Note>): UpdateNoteRequest {
  return {
    title: note.title || '',
    content: note.content || '',
    categories: note.categories || [],
  };
}