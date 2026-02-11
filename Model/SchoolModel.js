// src/Model/SchoolModel.js
const { admin, rtdb } = require('../Config/firebaseAdmin');

class SchoolModel {
  static SCHOOLS_REF = 'schools';
  static USERS_REF = 'users';
  static COUNTERS_REF = 'counters/schoolId';

  /**
   * Generates sequential school ID like SCH0001, SCH0002, ...
   */
  static async generateSchoolId() {
    try {
      const counterRef = rtdb.ref(this.COUNTERS_REF);

      const result = await counterRef.transaction((current) => {
        return (current || 0) + 1;
      }, (error, committed, snapshot) => {
        if (error) throw error;
        if (!committed) throw new Error('Transaction failed - counter not committed');
        return snapshot.val();
      });

      const counterValue = result.snapshot.val();
      return `SCH${String(counterValue).padStart(4, '0')}`;
    } catch (err) {
      console.error('School ID generation failed:', err);
      throw err;
    }
  }

  static async createSchool(schoolData) {
    const { name, email, password, phone } = schoolData;

    try {
      // 1. Generate proper sequential ID
      const schoolId = await this.generateSchoolId();

      // 2. Create Firebase Auth user
      const userRecord = await admin.auth().createUser({
        email: email.trim(),
        password,
        displayName: `${name.trim()} Admin`,
        disabled: false,
      });

      const uid = userRecord.uid;

      // 3. Set custom claims
      await admin.auth().setCustomUserClaims(uid, {
        schoolId,
        role: 'school_admin',
      });

      // 4. Save school info
      const schoolInfoRef = rtdb.ref(`${this.SCHOOLS_REF}/${schoolId}/info`);
      await schoolInfoRef.set({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        createdAt: admin.database.ServerValue.TIMESTAMP,
        status: 'active',
        lastLogin: null,
      });

      await rtdb.ref(`${this.USERS_REF}/${uid}/profile`).update({
        schoolId,
        role: 'school_admin',
        name: `${name.trim()} Admin`,
        createdAt: admin.database.ServerValue.TIMESTAMP,
      });

      return {
        success: true,
        schoolId,
        uid,
        email: email.trim(),
        message: 'School and admin account created successfully',
      };
    } catch (error) {
      console.error('Create school error:', error);
      return {
        success: false,
        error: error.code || 'internal-error',
        message: error.message,
      };
    }
  }

  static async listSchools() {
    try {
      const snapshot = await rtdb.ref(this.SCHOOLS_REF).once('value');
      if (!snapshot.exists()) return [];

      const schools = [];
      snapshot.forEach((child) => {
        const info = child.child('info').val() || {};
        schools.push({
          schoolId: child.key,
          ...info,
        });
      });

      // Optional: sort by createdAt or name
      schools.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      return schools;
    } catch (err) {
      console.error('List schools error:', err);
      throw err;
    }
  }

  static async getSchool(schoolId) {
    try {
      const snapshot = await rtdb.ref(`${this.SCHOOLS_REF}/${schoolId}/info`).once('value');
      return snapshot.val() || null;
    } catch (err) {
      console.error('Get school error:', err);
      return null;
    }
  }

  static async updateSchoolStatus(schoolId, status) {
    try {
      await rtdb.ref(`${this.SCHOOLS_REF}/${schoolId}/info/status`).set(status);
      return { success: true };
    } catch (err) {
      console.error('Update status error:', err);
      return { success: false, message: err.message };
    }
  }

  static async resetSchoolPassword(schoolId, newPassword) {
  try {
    const school = await this.getSchool(schoolId);
    if (!school?.email) {
      throw new Error('School not found or missing email');
    }

    console.log(`Resetting password for school ${schoolId} - email: ${school.email}`);

    const user = await admin.auth().getUserByEmail(school.email);
    console.log(`Found user UID: ${user.uid}`);

    await admin.auth().updateUser(user.uid, { password: newPassword });
    console.log(`Password updated successfully for UID ${user.uid}`);

    return { success: true, email: school.email };
  } catch (err) {
    console.error('Reset password failed:', {
      schoolId,
      errorCode: err.code,
      errorMessage: err.message,
      stack: err.stack?.substring(0, 300) // partial stack for brevity
    });
    return { success: false, message: err.message || 'Password reset failed' };
  }
}

  static async deleteSchool(schoolId) {
    try {
      const school = await this.getSchool(schoolId);
      if (!school?.email) {
        throw new Error('School not found');
      }

      const user = await admin.auth().getUserByEmail(school.email);

      // Delete auth user
      await admin.auth().deleteUser(user.uid);

      // Delete RTDB data
      await rtdb.ref(`${this.SCHOOLS_REF}/${schoolId}`).remove();
      await rtdb.ref(`${this.USERS_REF}/${user.uid}`).remove();

      return { success: true };
    } catch (error) {
      console.error('Delete school error:', error);
      return {
        success: false,
        error: error.code || 'delete-failed',
        message: error.message,
      };
    }
  }
  
}

module.exports = SchoolModel;