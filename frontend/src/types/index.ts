export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  likes: { userId: string }[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  likes: { userId: string }[];
  replies: Reply[];
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  author: User;
  likes: { userId: string }[];
  comments: Comment[];
  _count: {
    likes: number;
    comments: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}