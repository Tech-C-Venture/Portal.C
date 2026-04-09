/**
 * DatastoreClient
 * Firestoreクライアントのラッパー
 */

import { getDb, getFirebaseStorage } from '@/lib/firebase/admin';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

export class DatastoreClient {
  /**
   * Firestoreクライアント取得
   */
  static getClient(): Firestore {
    return getDb();
  }

  /**
   * Firebase Storageクライアント取得
   */
  static getStorage(): Storage {
    return getFirebaseStorage();
  }

  /**
   * 環境変数の検証
   */
  static validateEnvironment() {
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error('FIREBASE_PROJECT_ID is not set');
    }
  }
}
