const { admin, rtdb } = require('../Config/firebaseAdmin'); // your existing config

class AuthModel {
  
  static async verifyIdToken(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken, true); // checkRevoked: true

      return {
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email || decodedToken.email_verified ? decodedToken.email : '',
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        picture: decodedToken.picture || null,
        isAdmin: !!decodedToken.admin, // custom claim
        emailVerified: !!decodedToken.email_verified,
      };
    } catch (error) {
      console.error('Token verification failed:', error.code, error.message);
      return {
        success: false,
        error: error.code || 'auth/invalid-token',
        message: error.message,
      };
    }
  }


  static async getUserProfile(uid) {
    try {
      const snapshot = await rtdb.ref(`users/${uid}/profile`).once('value');
      return snapshot.val() || {};
    } catch (err) {
      console.error('Profile fetch error:', err);
      return {};
    }
  }

 
  static async setAdminClaim(uid, isAdmin = true) {
    try {
      await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
      return { success: true };
    } catch (err) {
      console.error('Set custom claim error:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = AuthModel;