import { Router } from 'express';
import {
  addComment,
  toggleCommentLike,
  addReply,
  toggleReplyLike,
  getCommentLikes,
  getReplyLikes,
} from '../controllers/comment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.post('/post/:id', addComment);
router.post('/:commentId/like', toggleCommentLike);
router.get('/:commentId/likes', getCommentLikes);
router.post('/:commentId/reply', addReply);
router.post('/reply/:replyId/like', toggleReplyLike);
router.get('/reply/:replyId/likes', getReplyLikes);

export default router;