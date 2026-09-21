import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { seedProducts } from '../data/seedProducts.js';

dotenv.config();

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dhakaflowertub';
  console.log(`Connecting to MongoDB at: ${uri}...`);

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected for seeding.');

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log(`Inserting ${seedProducts.length} curated products...`);
    const inserted = await Product.insertMany(seedProducts);

    console.log(`✓ Successfully seeded ${inserted.length} products to Dhaka Flower Tub database!`);
    process.exit(0);
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
};

seed();
