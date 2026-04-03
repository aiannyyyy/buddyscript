import { Router } from 'express';
import {
  createPost,
  getPosts,
  deletePost,
  togglePostLike,
  getPostLikes,
} from '../controllers/post.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', getPosts);
router.post('/', createPost);
router.delete('/:id', deletePost);
router.post('/:id/like', togglePostLike);
router.get('/:id/likes', getPostLikes);

export default router;