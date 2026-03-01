// IMPORTANT: Replace these with your actual Firebase project config
// Get from: https://console.firebase.google.com → Project Settings → Your Apps → Firebase SDK snippet

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDs0dIlUJ-3eLTOxiA5QpzLEUfZ5BOVraw",
    authDomain: "pachora-jalgaon-tracker.firebaseapp.com",
    databaseURL: "https://pachora-jalgaon-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "pachora-jalgaon-tracker",
    storageBucket: "pachora-jalgaon-tracker.firebasestorage.app",
    messagingSenderId: "934921741539",
    appId: "1:934921741539:web:6e9dd157721059d097d1d6",
    measurementId: "G-CC76V337PC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);

// Secondary app to create driver accounts without logging out admin
export const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);

export default app;
