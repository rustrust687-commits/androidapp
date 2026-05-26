import { db, auth } from '../firebase';
import {
  collection, addDoc, getDocs, query, orderBy, where,
  doc, updateDoc, deleteDoc, Timestamp
} from 'firebase/firestore';

const COL = 'workouts';

export const addWorkout = async (data) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const docRef = await addDoc(collection(db, COL), {
    exercise: data.exercise,
    weight: Number(data.weight),
    reps: Number(data.reps),
    datetime: data.datetime,
    timestamp: Timestamp.fromDate(new Date(data.datetime)),
    uid: user.uid,
  });
  return docRef.id;
};

export const getWorkouts = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(
    collection(db, COL),
    where('uid', '==', user.uid),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateWorkout = async (id, data) => {
  const updateData = {
    exercise: data.exercise,
    weight: Number(data.weight),
    reps: Number(data.reps),
    datetime: data.datetime,
    timestamp: Timestamp.fromDate(new Date(data.datetime)),
  };
  await updateDoc(doc(db, COL, id), updateData);
};

export const deleteWorkout = async (id) => {
  await deleteDoc(doc(db, COL, id));
};
