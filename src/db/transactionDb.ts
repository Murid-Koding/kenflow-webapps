import { openDB, type IDBPDatabase } from 'idb';

export interface Transaction {
  id?: number;
  name: string;
  amount: number;
  createdAt: number;
  dateKey: string;
}

const DB_NAME = 'expense-tracker';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

async function getDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('dateKey', 'dateKey');
      }
    },
  });
  return dbInstance;
}

export async function getTransactionsByDate(dateKey: string): Promise<Transaction[]> {
  const db = await getDb();
  return db.getAllFromIndex(STORE_NAME, 'dateKey', dateKey);
}

export async function getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return all.filter((tx) => tx.dateKey.startsWith(prefix));
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<number> {
  const db = await getDb();
  return db.add(STORE_NAME, tx) as Promise<number>;
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDb();
  return db.delete(STORE_NAME, id);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function replaceAllTransactions(transactions: Transaction[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  for (const item of transactions) {
    const { id, ...rest } = item;
    await store.add(rest);
  }
  await tx.done;
}
