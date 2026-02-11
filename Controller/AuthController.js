const AuthModel = require('../Model/AuthModel');

class AuthController {
  static async login(req, res) {
  if (!req.user) {
    return res.status(500).json({ success: false, error: 'User not attached' });
  }

  try {
    const profile = await AuthModel.getUserProfile(req.user.uid);

    const userData = {
      uid: req.user.uid,
      email: req.user.email,
      name: profile.name || req.user.name,
      isAdmin: req.user.isAdmin,
      schoolId: req.user.schoolId || profile.schoolId || null,  // ← important
      role: req.user.role || profile.role || 'user',
      picture: profile.picture || req.user.picture,
    };

    return res.json({
      success: true,
      user: userData,
    });
  } catch (err) {
    console.error('Login response error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
}

module.exports = AuthController;