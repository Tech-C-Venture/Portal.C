/**
 * Firebase Admin SDK 初期化
 * サーバーサイドでのFirestore/Storage操作に使用
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

function getFirebaseApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not set');
  }

  if (clientEmail && privateKey) {
    console.log('[firebase] Initializing with service account credentials');
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  console.warn('[firebase] FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY missing, using default credentials');
  return initializeApp({
    projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

let _db: Firestore | null = null;
let _storage: Storage | null = null;

export function getDb(): Firestore {
  if (!_db) {
    const app = getFirebaseApp();
    _db = getFirestore(app);
  }
  return _db;
}

export function getFirebaseStorage(): Storage {
  if (!_storage) {
    const app = getFirebaseApp();
    _storage = getStorage(app);
  }
  return _storage;
}
