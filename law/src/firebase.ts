import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let dbInstance: Firestore | null = null;

export function getFirebaseDb(): Firestore {
  if (!dbInstance) {
    let config: any = {};
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (err) {
        console.error('Error reading firebase-applet-config.json:', err);
      }
    }

    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const databaseId = config.firestoreDatabaseId || '(default)';
    dbInstance = getFirestore(app, databaseId);
  }
  return dbInstance;
}
