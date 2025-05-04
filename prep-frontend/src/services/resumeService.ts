import { authService } from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      if (!file || !['application/pdf'].includes(file.type)) {
        throw new Error('Invalid file type. Only PDF files are allowed.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB');
      }

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('isPublic', isPublic.toString());

      const response = await fetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      return data;
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
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const url = userId ? `${API_URL}/resume/${userId}` : `${API_URL}/resume`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch resume');
      }

      return data;
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
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/resume`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete resume');
      }

      return data;
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
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/resume/peer?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch peer resumes');
      }

      return data;
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
      const token = authService.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_URL}/resume/toggle-public`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle resume visibility');
      }

      return data;
    } catch (error: any) {
      console.error('Toggle public status error:', error);
      throw error;
    }
  },
};