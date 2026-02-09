const AuthModel = require('../Model/AuthModel');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  const result = await AuthModel.verifyIdToken(idToken);

  if (!result.success) {
    return res.status(401).json({
      success: false,
      error: result.error,
      message: result.message || 'Authentication failed',
    });
  }

  req.user = result; // attach to request → uid, email, isAdmin, ...
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'admin_required',
      message: 'Admin privileges required',
    });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };