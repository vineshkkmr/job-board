import * as admin from 'firebase-admin';

interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function getFirebaseAdminConfig(): FirebaseAdminConfig {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!privateKey || !projectId || !clientEmail) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, and FIREBASE_CLIENT_EMAIL env vars are required'
    );
  }

  // Handle private key with or without \n characters
  const formattedPrivateKey = privateKey.includes('\\n') 
    ? privateKey.replace(/\\n/g, '\n')
    : privateKey;

  return {
    projectId,
    clientEmail,
    privateKey: formattedPrivateKey,
  };
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    console.error('Environment variables:');
    console.error('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.error('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.error('Private Key exists:', !!process.env.FIREBASE_PRIVATE_KEY);
    throw error;
  }
}

export const auth = admin.auth();
