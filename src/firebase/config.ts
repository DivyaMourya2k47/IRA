import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB69zS2gdnSlBOm-jqoLeAyJwhRCizSdrE",
  authDomain: "iralast-a1eae.firebaseapp.com",
  projectId: "iralast-a1eae",
  storageBucket: "iralast-a1eae.firebasestorage.app",
  messagingSenderId: "997406503909",
  appId: "1:997406503909:web:c5ebe0fb0393271e2af50c",
  measurementId: "G-WKNR1DL9WH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore
const enableOfflinePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firebase persistence failed - multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('Firebase persistence not supported in this browser');
    }
  }
};

// Set auth persistence to local
const setAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error('Error setting auth persistence:', error);
  }
};

// Initialize persistence
enableOfflinePersistence();
setAuthPersistence();

export { auth, db, storage };

