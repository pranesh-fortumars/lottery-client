const admin = require('firebase-admin');
const serviceAccount = require('./studio-5255428477-b76d2-firebase-adminsdk.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function resetPassword(email, newPassword) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword
    });
    console.log(`Successfully synced and updated password for ${email}`);
  } catch (error) {
    console.error(`Error updating ${email}:`, error.message);
  }
}

async function run() {
  await resetPassword('smswinsms@gmail.com', 'admin123');
  await resetPassword('praneshs682@gmail.com', '123456');
  process.exit(0);
}

run();
