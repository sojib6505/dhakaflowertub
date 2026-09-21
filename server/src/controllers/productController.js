import Product from '../models/Product.js';
import { seedProducts as fallbackProducts, seedCategories } from '../data/seedProducts.js';
import { getDBStatus } from '../config/db.js';

// Helper to generate a URL-friendly slug
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Get all products with filtering, search, and sorting
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, featured, availability, sort = 'sortOrder', limit = 50, page = 1 } = req.query;
    const dbStatus = getDBStatus();

    // If DB is connected, fetch from MongoDB
    if (dbStatus.connected) {
      const query = {};

      if (category && category !== 'All Collections' && category !== 'All') {
        query.category = category;
      }

      if (featured === 'true') {
        query.isFeatured = true;
      }

      if (availability) {
        query.availability = availability;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { material: { $regex: search, $options: 'i' } }
        ];
      }

      let sortOption = { sortOrder: 1, createdAt: -1 };
      if (sort === 'price_asc') sortOption = { price: 1 };
      if (sort === 'price_desc') sortOption = { price: -1 };
      if (sort === 'newest') sortOption = { createdAt: -1 };

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit, 10));

      return res.json({
        success: true,
        source: 'database',
        count: products.length,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        data: products
      });
    }

    // Resilient Fallback (In-memory dataset when MongoDB is offline during initial preview)
    let filtered = [...fallbackProducts];

    if (category && category !== 'All Collections' && category !== 'All') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (featured === 'true') {
      filtered = filtered.filter((p) => p.isFeatured);
    }

    if (availability) {
      filtered = filtered.filter((p) => p.availability === availability);
    }

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.shortDescription?.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.material?.toLowerCase().includes(term)
      );
    }

    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'sortOrder') filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    return res.json({
      success: true,
      source: 'fallback',
      message: 'Serving curated seed data (MongoDB disconnected)',
      count: filtered.length,
      total: filtered.length,
      page: 1,
      pages: 1,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug or id
// @route   GET /api/products/:slugOrId
export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      let product = null;

      // Check if it's a valid MongoDB ObjectId or slug
      if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(slugOrId);
      }

      if (!product) {
        product = await Product.findOne({ slug: slugOrId.toLowerCase() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with identifier: ${slugOrId}`
        });
      }

      return res.json({
        success: true,
        source: 'database',
        data: product
      });
    }

    // Fallback search
    const product = fallbackProducts.find(
      (p) => p.slug === slugOrId.toLowerCase() || p.slug === slugOrId
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with slug: ${slugOrId}`
      });
    }

    return res.json({
      success: true,
      source: 'fallback',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories list
// @route   GET /api/products/categories
export const getCategories = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();

    if (dbStatus.connected) {
      const dbCategories = await Product.distinct('category');
      const uniqueCats = Array.from(new Set(['All Collections', ...dbCategories]));
      return res.json({
        success: true,
        data: uniqueCats
      });
    }

    return res.json({
      success: true,
      data: seedCategories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database connection required to create new products.'
      });
    }

    const { name, category, price, ...otherFields } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name and category'
      });
    }

    const slug = req.body.slug ? generateSlug(req.body.slug) : generateSlug(name);

    // Check slug uniqueness
    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A product with slug "${slug}" already exists. Please choose a different name or slug.`
      });
    }

    const product = await Product.create({
      name,
      slug,
      category,
      price: price || 0,
      priceDisplay: req.body.priceDisplay || (price ? `৳ ${price.toLocaleString()}` : 'Price on request'),
      ...otherFields
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database connection required to update products.'
      });
    }

    const { slugOrId } = req.params;

    if (req.body.name && !req.body.slug) {
      req.body.slug = generateSlug(req.body.name);
    }

    const updated = await Product.findByIdAndUpdate(slugOrId, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Product not found to update'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database connection required to delete products.'
      });
    }

    const { slugOrId } = req.params;
    const deleted = await Product.findByIdAndDelete(slugOrId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found to delete'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: { id: slugOrId }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed database with curated catalog
// @route   POST /api/products/seed
export const seedDatabase = async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();

    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Seed operation cannot proceed.'
      });
    }

    await Product.deleteMany({});
    const created = await Product.insertMany(fallbackProducts);

    res.json({
      success: true,
      message: `Database successfully seeded with ${created.length} products.`,
      count: created.length,
      data: created
    });
  } catch (error) {
    next(error);
  }
};
