const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');
const { requireAuth,requireAdmin } = require('../Middleware/AuthMiddle');

// POST /api/auth/login
// Body: {} (empty) — token comes in Authorization header
router.post('/login', requireAuth, AuthController.login);

// Example protected routes (later you add more)
router.get('/profile', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get('/admin-only', requireAuth, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Welcome admin!', email: req.user.email });
});

module.exports = router;