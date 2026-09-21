import express from 'express';
import { getCurrentAdmin, loginAdmin } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/me', requireAdmin, getCurrentAdmin);

export default router;
