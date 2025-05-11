import { authService } from './authService';
import { authFetch, handleResponse, getApiUrl } from './apiUtils';

const API_URL = getApiUrl();

interface Resume {
  resume_url: string;
  resume_text: string | null;
  is_public: boolean;
  filename: string | null;
  user_id: string;
  full_name: string | null;
}

interface PeerResume {
  id: string;
  resume_url: string;
  resume_filename: string | null;
  full_name: string | null;
  title: string | null;
}

interface ResumeResponse {
  message: string;
  url?: string;
  isPublic?: boolean;
}

interface PeerResumesResponse {
  resumes: PeerResume[];
}

interface TogglePublicResponse {
  message: string;
  isPublic: boolean;
}

/**
 * Resume service for handling API calls to the backend
 */
export const resumeService = {
  /**
   * Uploads a resume to the backend and Supabase Storage.
   * @param file - The resume file (PDF, <5MB)
   * @param isPublic - Whether the resume is publicly viewable
   * @returns ResumeResponse with upload details
   */
  uploadResume: async (file: File, isPublic: boolean): Promise<ResumeResponse> => {
    try {
      if (!file || !['application/pdf'].includes(file.type)) {
        throw new Error('Invalid file type. Only PDF files are allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB');
      }

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('isPublic', isPublic.toString());

      // For FormData, don't set Content-Type header - browser will set it with boundary
      const response = await authFetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        headers: {}, // Let authFetch add auth headers, but let browser set Content-Type for FormData
        body: formData,
      });

      return await handleResponse<ResumeResponse>(response);
    } catch (error: any) {
      console.error('Upload resume error:', error);
      throw error;
    }
  },

  /**
   * Retrieves a resume for the current user or a specified user.
   * @param userId - Optional user ID to fetch a peer's resume
   * @returns Resume details
   */
  getResume: async (userId?: string): Promise<Resume> => {
    try {
      const url = userId ? `${API_URL}/resume/${userId}` : `${API_URL}/resume`;

      const response = await authFetch(url, {
        method: 'GET',
      });

      return await handleResponse<Resume>(response);
    } catch (error: any) {
      console.error('Get resume error:', error);
      throw error;
    }
  },

  /**
   * Deletes the current user's resume.
   * @returns Success message
   */
  deleteResume: async (): Promise<{ message: string }> => {
    try {
      const response = await authFetch(`${API_URL}/resume`, {
        method: 'DELETE',
      });

      return await handleResponse<{ message: string }>(response);
    } catch (error: any) {
      console.error('Delete resume error:', error);
      throw error;
    }
  },

  /**
   * Fetches public resumes from other users.
   * @param page - Page number for pagination
   * @param limit - Number of resumes per page
   * @returns List of public resumes
   */
  getPeerResumes: async (page: number = 1, limit: number = 10): Promise<PeerResumesResponse> => {
    try {
      const response = await authFetch(`${API_URL}/resume/peer?page=${page}&limit=${limit}`, {
        method: 'GET',
      });

      return await handleResponse<PeerResumesResponse>(response);
    } catch (error: any) {
      console.error('Get peer resumes error:', error);
      throw error;
    }
  },

  /**
   * Toggles the public visibility of the current user's resume.
   * @param isPublic - Whether to make the resume public
   * @returns TogglePublicResponse with new status
   */
  togglePublicStatus: async (isPublic: boolean): Promise<TogglePublicResponse> => {
    try {
      const response = await authFetch(`${API_URL}/resume/toggle-public`, {
        method: 'POST',
        body: JSON.stringify({ isPublic }),
      });

      return await handleResponse<TogglePublicResponse>(response);
    } catch (error: any) {
      console.error('Toggle public status error:', error);
      throw error;
    }
  },
};