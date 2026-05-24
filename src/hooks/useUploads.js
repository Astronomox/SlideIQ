import { useState, useEffect } from 'react';
import {
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp,
  deleteDoc, doc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const toMs = (v) => v?.toDate ? v.toDate().getTime() : v instanceof Date ? v.getTime() : new Date(v ?? 0).getTime();

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
      if (e.code === 'failed-precondition' || (e.message && e.message.includes('index'))) {
        try {
          const q2 = query(collection(db, 'uploads'), where('uid', '==', user.uid));
          const snap = await getDocs(q2);
          const docs = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
          setUploads(docs);
        } catch (e2) {
          console.error('fetchUploads fallback:', e2);
        }
      } else {
        console.error('fetchUploads:', e);
      }
    } finally {
      setLoadingUploads(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [user]);

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

  const clearUploads = async () => {
    if (!user) return;
    // Delete every upload record from Firestore for this user
    await Promise.all(uploads.map(u => deleteDoc(doc(db, 'uploads', u.id))));
    setUploads([]);
  };

  return { uploads, loadingUploads, registerUpload, clearUploads, refetchUploads: fetchUploads };
}
