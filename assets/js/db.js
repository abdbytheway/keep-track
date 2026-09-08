// All Firestore reads/writes for expense transactions live here.
// Data model: users/{uid}/transactions/{transactionId}
//   { amount: number, category: string, merchant: string, note: string,
//     date: "YYYY-MM-DD", monthKey: "YYYY-MM", status: "paid" | "pending",
//     recurring: boolean, createdAt: server timestamp }
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { db } from "./firebase-init.js";
import { monthKeyOf, shiftMonthKey } from "./util.js";

const RETENTION_MONTHS = 3; // rolling window: current month + 2 previous months

function txCollection(uid) {
  return collection(db, "users", uid, "transactions");
}

export async function addTransaction(
  uid,
  { amount, category, merchant, note, date, status, recurring }
) {
  const monthKey = date.slice(0, 7); // "YYYY-MM" prefix of "YYYY-MM-DD"
  return addDoc(txCollection(uid), {
    amount: Number(amount),
    category,
    merchant: merchant || "",
    note: note || "",
    date,
    monthKey,
    status: status === "pending" ? "pending" : "paid",
    recurring: !!recurring,
    createdAt: serverTimestamp(),
  });
}

export async function deleteTransaction(uid, transactionId) {
  return deleteDoc(doc(db, "users", uid, "transactions", transactionId));
}

/** Live-subscribes to every transaction in a single month, newest first. */
export function subscribeMonth(uid, monthKey, onChange) {
  const q = query(
    txCollection(uid),
    where("monthKey", "==", monthKey),
    orderBy("date", "desc")
  );
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(rows);
  });
}

/** Returns the list of monthKeys currently inside the retention window, oldest first. */
export function retentionWindowMonthKeys(anchorDate = new Date()) {
  const current = monthKeyOf(anchorDate);
  const keys = [];
  for (let i = RETENTION_MONTHS - 1; i >= 0; i--) {
    keys.push(shiftMonthKey(current, -i));
  }
  return keys;
}

/** Live-subscribes to every transaction across the whole 3-month retention window. */
export function subscribeRetentionWindow(uid, onChange) {
  const monthKeys = retentionWindowMonthKeys();
  const q = query(txCollection(uid), where("monthKey", "in", monthKeys));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onChange(rows, monthKeys);
  });
}

/**
 * Deletes any transaction older than the 3-month retention window. Runs once
 * per sign-in (see app-shell.js) so the app never accumulates more than 3
 * months of a user's data, per the app's storage policy.
 */
export async function cleanupOldTransactions(uid) {
  const keep = retentionWindowMonthKeys();
  const q = query(txCollection(uid), where("monthKey", "not-in", keep));
  const snap = await getDocs(q);
  if (snap.empty) return 0;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

export function computeSummary(transactions) {
  const total = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const byCategory = {};
  for (const t of transactions) {
    byCategory[t.category] = (byCategory[t.category] || 0) + (Number(t.amount) || 0);
  }
  const count = transactions.length;
  const avg = count ? total / count : 0;
  let topCategory = null;
  let topAmount = -1;
  for (const [cat, amt] of Object.entries(byCategory)) {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  }
  return { total, count, avg, byCategory, topCategory, topAmount: topAmount < 0 ? 0 : topAmount };
}
