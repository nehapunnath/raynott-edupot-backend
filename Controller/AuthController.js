const AuthModel = require('../Model/AuthModel');

class AuthController {
  static async login(req, res) {
    

    if (!req.user) {
      return res.status(500).json({ success: false, error: 'User not attached' });
    }

    try {
      // Optional: merge with RTDB profile
      const profile = await AuthModel.getUserProfile(req.user.uid);

      const userData = {
        uid: req.user.uid,
        email: req.user.email,
        name: profile.name || req.user.name,
        isAdmin: req.user.isAdmin,
        picture: profile.picture || req.user.picture,
        // schoolId, role, permissions, etc. if needed
      };

      return res.json({
        success: true,
        user: userData,
        // You can also return a short-lived session token if you want (but usually not needed)
      });
    } catch (err) {
      console.error('Login response error:', err);
      return res.status(500).json({ success: false, error: 'Server error' });
    }
  }
}

module.exports = AuthController;