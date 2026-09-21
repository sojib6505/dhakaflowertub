import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET;

export const requireAdmin = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  const secret = getJwtSecret();
  if (!secret) {
    return res.status(503).json({
      success: false,
      message: 'Authentication is not configured.'
    });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (payload.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    req.admin = payload;
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Authentication token expired.' : 'Invalid authentication token.';
    return res.status(401).json({ success: false, message });
  }
};
