import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = () => {
  // Non-blocking background database connection
  connectDB().catch((err) => {
    console.warn(`[MongoDB Warning] Initial connection attempt failed: ${err.message}`);
  });

  const server = app.listen(PORT, () => {
    console.log(` Dhaka Flower Tub API running on http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Products API: http://localhost:${PORT}/api/products`);
  });

  return server;
};

startServer();
