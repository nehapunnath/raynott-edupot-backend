const express = require('express');
const router = express.Router();
const AuthController = require('../Controller/AuthController');
const SchoolController = require('../Controller/SchoolController');

const { requireAuth,requireAdmin } = require('../Middleware/AuthMiddle');

// POST /api/auth/login
router.post('/login', requireAuth, AuthController.login);

// Example protected routes (later you add more)
router.get('/profile', requireAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get('/admin-only', requireAuth, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Welcome admin!', email: req.user.email });
});

router.post('/schools',requireAuth, requireAdmin, SchoolController.createSchool);
router.get('/schools',requireAuth, requireAdmin, SchoolController.getAllSchools);
router.delete('/schools/:schoolId', requireAuth, requireAdmin, SchoolController.deleteSchool);
router.patch('/schools/:schoolId/status',requireAuth, requireAdmin, SchoolController.toggleSchoolStatus);
router.post('/schools/:schoolId/reset-password',requireAuth, requireAdmin, SchoolController.resetPassword);





module.exports = router;