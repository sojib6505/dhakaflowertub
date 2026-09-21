import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const safeEqual = (providedValue, configuredValue) => {
  if (typeof providedValue !== 'string' || typeof configuredValue !== 'string' || !providedValue || !configuredValue) return false;

  const providedBuffer = Buffer.from(providedValue);
  const configuredBuffer = Buffer.from(configuredValue);
  if (providedBuffer.length !== configuredBuffer.length) return false;

  return crypto.timingSafeEqual(providedBuffer, configuredBuffer);
};

const getAuthConfiguration = () => ({
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '8h'
});

export const loginAdmin = (req, res) => {
  const { username, password } = req.body || {};
  const configuration = getAuthConfiguration();

  if (!configuration.username || !configuration.password || !configuration.secret) {
    return res.status(503).json({
      success: false,
      message: 'Admin authentication is not configured.'
    });
  }

  if (!safeEqual(username, configuration.username) || !safeEqual(password, configuration.password)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.'
    });
  }

  const token = jwt.sign(
    { username: configuration.username, role: 'admin' },
    configuration.secret,
    { algorithm: 'HS256', expiresIn: configuration.expiresIn }
  );

  return res.json({
    success: true,
    token,
    admin: { username: configuration.username, role: 'admin' }
  });
};

export const getCurrentAdmin = (req, res) => res.json({
  success: true,
  admin: { username: req.admin.username, role: req.admin.role }
});
