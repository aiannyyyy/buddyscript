import { Router, Response } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware';
import { uploadImage } from '../utils/cloudinary';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Store file in memory buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post('/', protect, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No image file provided' });
      return;
    }

    const imageUrl = await uploadImage(req.file.buffer, 'posts');

    res.json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

export default router;