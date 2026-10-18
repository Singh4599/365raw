// firebase-config.js — LV Spices Raw Material Register
// Project: raw-7aafd | Collection: raw_material_inward

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAzWBQ2ZslOndYWRpFx8AKgDSwF9vDe8_I",
  authDomain: "raw-7aafd.firebaseapp.com",
  projectId: "raw-7aafd",
  storageBucket: "raw-7aafd.firebasestorage.app",
  messagingSenderId: "992270857047",
  appId: "1:992270857047:web:76a44674842ef48d190412"
};

export const COLLECTION_NAME = "raw_material_inward";

let db = null;

export function updateCloudBadge(connected) {
  const badge = document.getElementById('cloud-status-badge');
  const text = document.getElementById('cloud-status-text');
  if (badge && text) {
    if (connected) {
      badge.className = 'cloud-status-pill connected';
      text.textContent = 'Cloud Synced (Firestore)';
    } else {
      badge.className = 'cloud-status-pill offline';
      text.textContent = 'Offline / Local Mode';
    }
  }
}

export function initFirebase() {
  if (db) return db;
  try {
    const app = getApps().find(a => a.name === 'raw') || initializeApp(firebaseConfig, 'raw');
    db = getFirestore(app);
    console.log('[Firebase] Raw Material DB connected: raw-7aafd');
    updateCloudBadge(true);
    return db;
  } catch (err) {
    console.warn('[Firebase] Init notice:', err);
    updateCloudBadge(false);
    return null;
  }
}

export async function saveEntryToCloud(entry) {
  const database = initFirebase();
  if (!database) return false;
  try {
    const docId = String(entry.id);
    const data = { ...entry, updatedAt: Date.now() };
    if (data.thumbData && data.thumbData.length > 50000) delete data.thumbData;
    await setDoc(doc(database, COLLECTION_NAME, docId), data, { merge: true });
    updateCloudBadge(true);
    return true;
  } catch (err) {
    console.error('[Firebase] Save error:', err);
    updateCloudBadge(false);
    return false;
  }
}

export async function deleteEntryFromCloud(entryId) {
  const database = initFirebase();
  if (!database) return false;
  try {
    await deleteDoc(doc(database, COLLECTION_NAME, String(entryId)));
    updateCloudBadge(true);
    return true;
  } catch (err) {
    console.error('[Firebase] Delete error:', err);
    return false;
  }
}

export async function loadAllRawEntriesFromCloud() {
  const database = initFirebase();
  if (!database) return [];
  try {
    const q = query(collection(database, COLLECTION_NAME), orderBy("date", "desc"), limit(400));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d => {
      list.push({ id: d.id, ...d.data() });
    });
    updateCloudBadge(true);
    return list;
  } catch (err) {
    console.warn('[Firebase] Bulk load error:', err);
    return [];
  }
}

// Auto-initialize
try {
  initFirebase();
} catch (e) {}
