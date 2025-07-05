// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  bio?: string;
}

// Blog related types
export interface Blog {
  id: number;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  likeCount?: number;
  commentCount?: number;
  hashtags?: string[];
}

export interface BlogResponse {
  id: number;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  likeCount?: number;
  commentCount?: number;
  hashtags?: string[];
}

// Comment related types
export interface Comment {
  id: number;
  content: string;
  author?: User;
  blog?: Blog;
  createdAt: string;
  authorUsername?: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  authorUsername: string;
  createdAt: string;
  blogId: number;
}

// Authentication related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  bio?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UserProfileRequest {
  fullName: string;
  bio: string;
  profilePicture: string;
}

export interface PublicUserProfileDTO {
  username: string;
  fullName?: string;
  bio?: string;
  profilePicture?: string;
} 