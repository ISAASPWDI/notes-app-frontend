// services/api.ts
import type {
  NoteDTO,
  PageResponse,
  CreateNoteRequest,
  UpdateNoteRequest,
  AddCategoriesRequest,
  SortOption,
} from '../types/notes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://notes-app-backend-b2wd.onrender.com/api";



class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'An error occurred',
      response.status,
      errorData
    );
  }
  
  // For 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

export const notesApi = {
  // Get notes with pagination and filters
  getNotes: async (params: {
    page?: number;
    size?: number;
    sortBy?: SortOption;
    archived?: boolean;
    categories?: string[];
    search?: string;
  } = {}): Promise<PageResponse<NoteDTO>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.archived !== undefined) queryParams.append('archived', params.archived.toString());
    if (params.categories && params.categories.length > 0) {
      queryParams.append('categories', params.categories.join(','));
    }
    if (params.search) queryParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/notes?${queryParams}`);
    return handleResponse<PageResponse<NoteDTO>>(response);
  },

  // Get single note by ID
  getNoteById: async (id: number): Promise<NoteDTO> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`);
    return handleResponse<NoteDTO>(response);
  },

  // Create new note
  createNote: async (note: CreateNoteRequest): Promise<NoteDTO> => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    return handleResponse<NoteDTO>(response);
  },

  // Update existing note
  updateNote: async (id: number, note: UpdateNoteRequest): Promise<NoteDTO> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    return handleResponse<NoteDTO>(response);
  },

  // Toggle archive status
  toggleArchive: async (id: number): Promise<NoteDTO> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/archive`, {
      method: 'PATCH',
    });
    return handleResponse<NoteDTO>(response);
  },

  // Delete note
  deleteNote: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // Add categories to note
  addCategories: async (id: number, categories: string[]): Promise<NoteDTO> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories } as AddCategoriesRequest),
    });
    return handleResponse<NoteDTO>(response);
  },

  // Remove category from note
  removeCategory: async (id: number, category: string): Promise<NoteDTO> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/categories/${encodeURIComponent(category)}`, {
      method: 'DELETE',
    });
    return handleResponse<NoteDTO>(response);
  },
};

export { ApiError };