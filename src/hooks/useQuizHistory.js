import { useState, useEffect } from 'react';
import {
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export function useQuizHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'quizHistory'),
        where('uid', '==', user.uid),
        orderBy('completedAt', 'desc')
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('fetchHistory:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const saveQuizResult = async (result) => {
    if (!user) return;
    const docRef = await addDoc(collection(db, 'quizHistory'), {
      uid: user.uid,
      ...result,
      completedAt: serverTimestamp(),
    });
    const newEntry = { id: docRef.id, ...result, completedAt: new Date() };
    setHistory(prev => [newEntry, ...prev]);
    return docRef.id;
  };

  return { history, loadingHistory, saveQuizResult, refetchHistory: fetchHistory };
}
