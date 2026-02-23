import admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (!adminApp) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccount) {
      try {
        const cert = JSON.parse(serviceAccount);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(cert),
          projectId: process.env.VITE_FIREBASE_PROJECT_ID
        });
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
        // Fallback to application default credentials if available
        adminApp = admin.initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID
        });
      }
    } else {
      // Fallback to application default credentials
      adminApp = admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      });
    }
  }
  return adminApp;
}

export const adminAuth = () => getFirebaseAdmin().auth();
export const adminDb = () => getFirebaseAdmin().firestore();
