import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Create Post
export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, visibility, imageUrl } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        visibility: visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
        authorId: req.userId!,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: { select: { userId: true } },
        comments: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            likes: { select: { userId: true } },
            replies: {
              include: {
                author: {
                  select: { id: true, firstName: true, lastName: true, avatar: true },
                },
                likes: { select: { userId: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Posts (Feed)
export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          { authorId: req.userId, visibility: 'PRIVATE' },
        ],
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: { select: { userId: true } },
        comments: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
            likes: { select: { userId: true } },
            replies: {
              include: {
                author: {
                  select: { id: true, firstName: true, lastName: true, avatar: true },
                },
                likes: { select: { userId: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.post.count({
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          { authorId: req.userId, visibility: 'PRIVATE' },
        ],
      },
    });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Post
export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.authorId !== req.userId) {
      res.status(403).json({ message: 'Not authorized to delete this post' });
      return;
    }

    await prisma.post.delete({ where: { id } });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Like / Unlike Post
export const togglePostLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const existingLike = await prisma.postLike.findUnique({
      where: { userId_postId: { userId: req.userId!, postId: id } },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: { userId_postId: { userId: req.userId!, postId: id } },
      });
      res.json({ message: 'Post unliked', liked: false });
    } else {
      await prisma.postLike.create({
        data: { userId: req.userId!, postId: id },
      });
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Post Likes (who liked)
export const getPostLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const likes = await prisma.postLike.findMany({
      where: { postId: id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });

    res.json({ likes });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};