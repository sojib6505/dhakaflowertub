import express from 'express';
import {
  getProducts,
  getProductBySlugOrId,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  seedDatabase
} from '../controllers/productController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Product Categories
router.get('/categories', getCategories);

// Seed Database Endpoint (for initial provisioning)
router.post('/seed', requireAdmin, seedDatabase);

// Product CRUD
router.route('/')
  .get(getProducts)
  .post(requireAdmin, createProduct);

router.route('/:slugOrId')
  .get(getProductBySlugOrId)
  .put(requireAdmin, updateProduct)
  .delete(requireAdmin, deleteProduct);

export default router;
