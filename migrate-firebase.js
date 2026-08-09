const admin = require('firebase-admin');

// 1. Download Service Account Keys from Firebase Console for both projects
// Go to Project Settings -> Service Accounts -> Generate New Private Key
const serviceAccountSecondary = require('./lottery-application-136-firebase-adminsdk.json');
const serviceAccountPrimary = require('./studio-5255428477-b76d2-firebase-adminsdk.json');

// 2. Initialize both apps
const secondaryApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountSecondary)
}, 'secondary');

const primaryApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPrimary)
}, 'primary');

const dbSecondary = secondaryApp.firestore();
const dbPrimary = primaryApp.firestore();

// 3. Define collections to migrate
const collections = ['users', 'tickets', 'results', 'transactions', 'settings'];

async function migrateCollection(collectionName) {
  console.log(`Migrating collection: ${collectionName}...`);
  const snapshot = await dbSecondary.collection(collectionName).get();
  
  if (snapshot.empty) {
    console.log(`No documents found in ${collectionName}.`);
    return;
  }

  const batchSize = 400;
  let batch = dbPrimary.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    const docRef = dbPrimary.collection(collectionName).doc(doc.id);
    batch.set(docRef, doc.data());
    count++;

    if (count % batchSize === 0) {
      await batch.commit();
      batch = dbPrimary.batch();
      console.log(`Committed ${count} documents in ${collectionName}...`);
    }
  }

  if (count % batchSize !== 0) {
    await batch.commit();
  }
  
  console.log(`Finished migrating ${count} documents in ${collectionName}.`);
}

async function runMigration() {
  try {
    for (const col of collections) {
      await migrateCollection(col);
    }
    console.log('✅ Firestore Migration Complete!');
  } catch (error) {
    console.error('❌ Migration Error:', error);
  }
}

runMigration();
