import api from './axios';
import type { Post, Pagination } from '../types/index';

interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

interface PostResponse {
  post: Post;
}

export const getPosts = async (page = 1): Promise<PostsResponse> => {
  const res = await api.get(`/posts?page=${page}&limit=10`);
  return res.data;
};

export const createPost = async (data: {
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  imageUrl?: string;
}): Promise<PostResponse> => {
  const res = await api.post('/posts', data);
  return res.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await api.delete(`/posts/${postId}`);
};

export const togglePostLike = async (postId: string): Promise<{ liked: boolean }> => {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
};

export const getPostLikes = async (postId: string) => {
  const res = await api.get(`/posts/${postId}/likes`);
  return res.data;
};

export const addComment = async (postId: string, content: string) => {
  const res = await api.post(`/comments/post/${postId}`, { content });
  return res.data;
};

export const toggleCommentLike = async (commentId: string) => {
  const res = await api.post(`/comments/${commentId}/like`);
  return res.data;
};

export const addReply = async (commentId: string, content: string) => {
  const res = await api.post(`/comments/${commentId}/reply`, { content });
  return res.data;
};

export const toggleReplyLike = async (replyId: string) => {
  const res = await api.post(`/comments/reply/${replyId}/like`);
  return res.data;
};

export const getCommentLikes = async (commentId: string) => {
  const res = await api.get(`/comments/${commentId}/likes`);
  return res.data;
};

export const getReplyLikes = async (replyId: string) => {
  const res = await api.get(`/comments/reply/${replyId}/likes`);
  return res.data;
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.imageUrl;
};