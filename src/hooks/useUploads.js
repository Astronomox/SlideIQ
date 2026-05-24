import { useState, useEffect } from 'react';
import {
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

// Tracks upload metadata in Firestore (filename, date) and nothing else.
// Extracted text lives in React state only — never sent to any server.
export function useUploads() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  const fetchUploads = async () => {
    if (!user) return;
    setLoadingUploads(true);
    try {
      const q = query(
        collection(db, 'uploads'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setUploads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('fetchUploads:', e);
    } finally {
      setLoadingUploads(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [user]);

  // Records filename + date in Firestore. The PDF itself and its text are never stored.
  const registerUpload = async (filename) => {
    if (!user) throw new Error('Not authenticated');
    const docRef = await addDoc(collection(db, 'uploads'), {
      uid: user.uid,
      filename,
      createdAt: serverTimestamp(),
    });
    const newDoc = {
      id: docRef.id,
      uid: user.uid,
      filename,
      createdAt: new Date(),
    };
    setUploads(prev => [newDoc, ...prev]);
    return newDoc;
  };

  return { uploads, loadingUploads, registerUpload, refetchUploads: fetchUploads };
}
