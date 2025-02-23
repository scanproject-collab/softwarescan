import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json'); // Gere a chave de serviço no Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-database-url.firebaseio.com"
});

export default admin;
