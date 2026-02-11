// src/Controller/SchoolController.js
const SchoolModel = require('../Model/SchoolModel');

class SchoolController {
    
  static async createSchool(req, res) {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await SchoolModel.createSchool({ name, email, password, phone });

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  }

  static async getAllSchools(req, res) {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    try {
      const schools = await SchoolModel.listSchools();
      res.json({ success: true, schools });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to fetch schools' });
    }
  }

  static async toggleSchoolStatus(req, res) {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { schoolId } = req.params;
    const { status } = req.body; // "active" | "inactive"

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await SchoolModel.updateSchoolStatus(schoolId, status);
    res.json(result);
  }

  static async resetPassword(req, res) {
    if (!req.user?.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const { schoolId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password too short' });
    }

    const result = await SchoolModel.resetSchoolPassword(schoolId, newPassword);

    if (result.success) {
      res.json({
        success: true,
        message: 'Password reset successful',
        email: result.email,
        // Do NOT return newPassword in response in production!
        // Show it only once in admin UI modal
      });
    } else {
      res.status(400).json(result);
    }
  }
  static async deleteSchool(req, res) {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'schoolId is required' });
    }

    const result = await SchoolModel.deleteSchool(schoolId);

    if (result.success) {
      res.json({ success: true, message: 'School and associated account deleted successfully' });
    } else {
      res.status(400).json(result);
    }
  }
}

module.exports = SchoolController;