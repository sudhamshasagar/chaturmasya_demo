import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

/* ==============================
   Check if user exists
============================== */

export const checkUser = async (mobile) => {
  const userRef = doc(db, "users", mobile);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data();
  }

  return null;
};

/* ==============================
   Create new user
============================== */

export const createUser = async ({ name, mobile }) => {
  const userRef = doc(db, "users", mobile);

  await setDoc(userRef, {
    name,
    mobile,
    createdAt: serverTimestamp(),
  });

  return true;
};

/* ==============================
   Save Japa / Shloka Record
============================== */

export const saveRecord = async ({
  name,
  mobile,
  type,
  date,
  count,
}) => {
  // Save individual record
  await addDoc(collection(db, "records"), {
    name,
    mobile,
    type,
    date,
    count: Number(count),
    createdAt: serverTimestamp(),
  });

  // Update global total
  const totalRef = doc(db, "globalTotals", type);

  const totalSnap = await getDoc(totalRef);

  if (totalSnap.exists()) {
    await updateDoc(totalRef, {
      count: increment(Number(count)),
    });
  } else {
    await setDoc(totalRef, {
      count: Number(count),
    });
  }

  return true;
};

/* ==============================
   Get User History
============================== */

export const getHistory = async (mobile) => {
  const q = query(
    collection(db, "records"),
    where("mobile", "==", mobile),
    orderBy("date", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ==============================
   User Summary
============================== */

export const getSummary = async (mobile) => {
  const records = await getHistory(mobile);

  const summary = {};

  records.forEach((item) => {
    if (!summary[item.type]) {
      summary[item.type] = 0;
    }

    summary[item.type] += Number(item.count);
  });

  return summary;
};

/* ==============================
   Global Totals
============================== */

export const getGlobalTotals = async () => {
  const snap = await getDocs(collection(db, "globalTotals"));

  return snap.docs.map((doc) => ({
    type: doc.id,
    ...doc.data(),
  }));
};

/* ==============================
   Get Available Japa / Shloka Types
============================== */

export const getJapaTypes = async () => {
  try {
    const snap = await getDocs(collection(db, "japaTypes"));

    console.log("================================");
    console.log("JAPA TYPES COUNT:", snap.docs.length);

    snap.docs.forEach((d) => {
      console.log(d.id, d.data());
    });

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("JAPA TYPES ERROR:", err);
    return [];
  }
}; 