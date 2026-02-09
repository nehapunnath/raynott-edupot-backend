// backend/setAdmin.js
require('dotenv').config();
const { admin } = require('./Config/firebaseAdmin');

const setAdmin = async (email) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`SUCCESS! ${email} is now ADMIN`);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// CHANGE THIS EMAIL TO YOUR ADMIN EMAIL
setAdmin("admin@raynottedupot.com"); 