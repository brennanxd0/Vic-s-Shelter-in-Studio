import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfigData from '../firebase-applet-config.json';

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin() {
  if (!adminApp) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId;
    
    if (serviceAccount) {
      try {
        const cert = JSON.parse(serviceAccount);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(cert),
          projectId: projectId
        });
      } catch (error) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
        // Fallback to application default credentials if available
        adminApp = admin.initializeApp({
          projectId: projectId
        });
      }
    } else {
      // Fallback to application default credentials
      adminApp = admin.initializeApp({
        projectId: projectId
      });
    }
  }
  return adminApp;
}

export const adminAuth = () => getFirebaseAdmin().auth();
export const adminDb = () => getFirestore(getFirebaseAdmin(), firebaseConfigData.firestoreDatabaseId);
