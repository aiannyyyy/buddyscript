import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Add Comment
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: { content, authorId: req.userId!, postId },
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
    });

    res.status(201).json({ message: 'Comment added', comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle Comment Like
export const toggleCommentLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId: req.userId!, commentId } },
    });

    if (existing) {
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId: req.userId!, commentId } },
      });
      res.json({ message: 'Comment unliked', liked: false });
    } else {
      await prisma.commentLike.create({
        data: { userId: req.userId!, commentId },
      });
      res.json({ message: 'Comment liked', liked: true });
    }
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add Reply
export const addReply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const reply = await prisma.reply.create({
      data: { content, authorId: req.userId!, commentId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: { select: { userId: true } },
      },
    });

    res.status(201).json({ message: 'Reply added', reply });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Toggle Reply Like
export const toggleReplyLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { replyId } = req.params;

    const existing = await prisma.replyLike.findUnique({
      where: { userId_replyId: { userId: req.userId!, replyId } },
    });

    if (existing) {
      await prisma.replyLike.delete({
        where: { userId_replyId: { userId: req.userId!, replyId } },
      });
      res.json({ message: 'Reply unliked', liked: false });
    } else {
      await prisma.replyLike.create({
        data: { userId: req.userId!, replyId },
      });
      res.json({ message: 'Reply liked', liked: true });
    }
  } catch (error) {
    console.error('Toggle reply like error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Comment Likes
export const getCommentLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;

    const likes = await prisma.commentLike.findMany({
      where: { commentId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    res.json({ likes });
  } catch (error) {
    console.error('Get comment likes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Reply Likes
export const getReplyLikes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { replyId } = req.params;

    const likes = await prisma.replyLike.findMany({
      where: { replyId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    res.json({ likes });
  } catch (error) {
    console.error('Get reply likes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};