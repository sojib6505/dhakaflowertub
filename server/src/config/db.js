import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dhakaflowertub';

  if (isConnected) {
    console.log('MongoDB already connected.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn('[MongoDB Warning] Could not connect to the configured MongoDB instance.');
    console.warn(`[MongoDB Warning] Reason: ${error.message}`);
    console.warn('[MongoDB Notice] Server will operate in resilient mode with seed fallback.');
  }
};

export const getDBStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null
});
