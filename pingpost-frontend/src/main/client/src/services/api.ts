import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse, User, Blog, Comment, PaginatedResponse, BlogResponse, PublicUserProfileDTO, CommentResponse } from '../types';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload;
  } catch {
    return null;
  }
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (err: unknown) {
      console.error('Login error:', err);
      throw err;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (err: unknown) {
      console.error('Register error:', err);
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: (): User | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      
      const payload = parseJwt(token);
      if (!payload) {
        return null;
      }

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (payload.exp && (payload.exp as number) < currentTime) {
        localStorage.removeItem('token');
        return null;
      }

      // Extract user details from JWT claims
      const user: User = {
        id: payload.id as number,
        username: payload.sub as string, // JWT subject is the username
        email: payload.email as string,
        fullName: payload.fullName as string,
        profilePicture: payload.profilePicture as string | undefined,
        bio: payload.bio as string | undefined,
      };
      
      return user;
    } catch (err: unknown) {
      console.error('Error getting current user:', err);
      return null;
    }
  },
};

export const blogService = {
  getBlogs: async (page = 0, size = 10): Promise<PaginatedResponse<Blog>> => {
    const response = await api.get<PaginatedResponse<Blog>>(`/blogs?page=${page}&size=${size}`);
    return response.data;
  },

  getBlog: async (id: number): Promise<Blog> => {
    const response = await api.get<BlogResponse>(`/blogs/${id}`);
    return response.data;
  },

  createBlog: async (data: Partial<Blog>): Promise<Blog> => {
    const response = await api.post<ApiResponse<Blog>>('/blogs', data);
    return response.data.data;
  },

  updateBlog: async (id: number, data: Partial<Blog>): Promise<Blog> => {
    const response = await api.put<Blog>(`/blogs/${id}`, data);
    return response.data;
  },

  deleteBlog: async (id: number): Promise<void> => {
    await api.delete(`/blogs/${id}`);
  },

  getBlogsByUser: async (username: string): Promise<Blog[]> => {
    const response = await api.get<Blog[]>(`/blogs/user/${username}`);
    return response.data;
  },
};

export const commentService = {
  getComments: async (blogId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`/blogs/${blogId}/comments`);
    return response.data;
  },

  addComment: async (blogId: number, content: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/blogs/${blogId}/comments`, { content });
    return response.data;
  },

  deleteComment: async (blogId: number, commentId: number): Promise<void> => {
    await api.delete(`/blogs/${blogId}/comments/${commentId}`);
  },

  updateComment: async (blogId: number, commentId: number, content: string): Promise<Comment> => {
    const response = await api.put<Comment>(`/blogs/${blogId}/comments/${commentId}`, { content });
    return response.data;
  },
};

export const likeService = {
  likeBlog: async (blogId: number): Promise<void> => {
    await api.post(`/blogs/${blogId}/likes`);
  },

  unlikeBlog: async (blogId: number): Promise<void> => {
    await api.delete(`/blogs/${blogId}/likes`);
  },

  getLikeCount: async (blogId: number): Promise<number> => {
    const response = await api.get<number>(`/blogs/${blogId}/likes/count`);
    return response.data;
  },

  isBlogLikedByUser: async (blogId: number): Promise<boolean> => {
    const response = await api.get<boolean>(`/blogs/${blogId}/likes/is-liked`);
    return response.data;
  },
};

export interface UserProfileRequest {
  fullName: string;
  bio: string;
  profilePicture: string;
}

export const userService = {
  updateProfile: async (data: UserProfileRequest): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },
  getLikedBlogs: async (): Promise<BlogResponse[]> => {
    const response = await api.get<BlogResponse[]>('/users/me/likes');
    return response.data;
  },
  getUserComments: async (): Promise<CommentResponse[]> => {
    const response = await api.get<CommentResponse[]>('/users/me/comments');
    return response.data;
  },
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  followUser: async (username: string): Promise<void> => {
    await api.post(`/users/${encodeURIComponent(username)}/follow`);
  },
  unfollowUser: async (username: string): Promise<void> => {
    await api.post(`/users/${encodeURIComponent(username)}/unfollow`);
  },
  getFollowersCount: async (username: string): Promise<number> => {
    const response = await api.get<number>(`/users/${encodeURIComponent(username)}/followers/count`);
    return response.data;
  },
  getFollowingCount: async (username: string): Promise<number> => {
    const response = await api.get<number>(`/users/${encodeURIComponent(username)}/following/count`);
    return response.data;
  },
  getPublicProfile: async (username: string): Promise<PublicUserProfileDTO> => {
    const response = await api.get<PublicUserProfileDTO>(`/users/public/${encodeURIComponent(username)}`);
    return response.data;
  },
  isFollowing: async (username: string): Promise<boolean> => {
    const response = await api.get<boolean>(`/users/${encodeURIComponent(username)}/is-following`);
    return response.data;
  },
  getFollowers: async (username: string): Promise<PublicUserProfileDTO[]> => {
    const response = await api.get<PublicUserProfileDTO[]>(`/users/${encodeURIComponent(username)}/followers`);
    return response.data;
  },
  getFollowing: async (username: string): Promise<PublicUserProfileDTO[]> => {
    const response = await api.get<PublicUserProfileDTO[]>(`/users/${encodeURIComponent(username)}/following`);
    return response.data;
  },
};

export default api; 