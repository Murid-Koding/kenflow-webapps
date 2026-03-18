import { create } from 'zustand';
import {
  addTransaction,
  deleteTransaction,
  getTransactionsByDate,
  type Transaction,
} from '../db/transactionDb';

function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, offset: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + offset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseInput(raw: string): { name: string; amount: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lastSpace = trimmed.lastIndexOf(' ');
  if (lastSpace === -1) return null;

  const name = trimmed.slice(0, lastSpace).trim();
  const amountStr = trimmed.slice(lastSpace + 1).trim().toLowerCase();

  if (!name || !amountStr) return null;

  let amount: number;
  if (amountStr.endsWith('k')) {
    const num = parseFloat(amountStr.slice(0, -1));
    if (isNaN(num)) return null;
    amount = Math.round(num * 1000);
  } else {
    amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) return null;
  }

  if (amount <= 0) return null;

  return { name, amount };
}

export function formatAmount(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return value.toString();
}

export function getDateLabel(dateKey: string): string {
  const today = getTodayDateKey();
  if (dateKey === today) return 'Hari ini';
  if (dateKey === addDays(today, -1)) return 'Kemarin';
  if (dateKey === addDays(today, 1)) return 'Besok';

  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function computeTrend(
  currentTotal: number,
  prevTotal: number
): string | null {
  if (currentTotal === 0 && prevTotal === 0) return null;
  if (prevTotal === 0) return null;

  const diff = currentTotal - prevTotal;
  if (diff > 0) {
    return `Lebih boros +${formatAmount(diff)}`;
  }
  if (diff < 0) {
    return `Lebih hemat -${formatAmount(Math.abs(diff))}`;
  }
  return 'Sama seperti kemarin';
}

interface ExpenseState {
  transactions: Transaction[];
  input: string;
  isLoading: boolean;
  selectedDateKey: string;
  cache: Record<string, Transaction[]>;
  trendText: string | null;
  loadForDate: (dateKey: string) => Promise<void>;
  setInput: (val: string) => void;
  addFromInput: () => Promise<void>;
  removeTransaction: (id: number) => Promise<void>;
  goToPrevDay: () => Promise<void>;
  goToNextDay: () => Promise<void>;
  isToday: () => boolean;
}

const updateTrendFn = async (
  dateKey: string,
  cache: Record<string, Transaction[]>,
  set: (partial: Partial<ExpenseState>) => void
) => {
  const prevKey = addDays(dateKey, -1);
  let prevTxs = cache[prevKey];

  if (!prevTxs) {
    prevTxs = await getTransactionsByDate(prevKey);
  }

  const currentTotal = (cache[dateKey] ?? []).reduce((s, tx) => s + tx.amount, 0);
  const prevTotal = prevTxs.reduce((s, tx) => s + tx.amount, 0);
  const text = computeTrend(currentTotal, prevTotal);
  set({ trendText: text });
};

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  transactions: [],
  input: '',
  isLoading: false,
  selectedDateKey: getTodayDateKey(),
  cache: {},
  trendText: null,

  loadForDate: async (dateKey) => {
    const { cache } = get();
    if (cache[dateKey]) {
      set({ transactions: cache[dateKey], selectedDateKey: dateKey, isLoading: false });
      await updateTrendFn(dateKey, cache, set);
      return;
    }

    set({ isLoading: true });
    const txs = await getTransactionsByDate(dateKey);
    const newCache = { ...cache, [dateKey]: txs };
    set({
      transactions: txs,
      selectedDateKey: dateKey,
      cache: newCache,
      isLoading: false,
    });
    await updateTrendFn(dateKey, newCache, set);
  },

  setInput: (val) => set({ input: val }),

  addFromInput: async () => {
    const { input, selectedDateKey } = get();
    const parsed = parseInput(input);
    if (!parsed) return;

    const now = Date.now();

    const newTx: Omit<Transaction, 'id'> = {
      name: parsed.name,
      amount: parsed.amount,
      createdAt: now,
      dateKey: selectedDateKey,
    };

    const id = await addTransaction(newTx);

    set((state) => {
      const updated = [...state.transactions, { ...newTx, id }];
      const newCache = { ...state.cache, [selectedDateKey]: updated };
      updateTrendFn(selectedDateKey, newCache, set);
      return {
        transactions: updated,
        input: '',
        cache: newCache,
      };
    });
  },

  removeTransaction: async (id) => {
    const { selectedDateKey } = get();
    await deleteTransaction(id);
    set((state) => {
      const updated = state.transactions.filter((tx) => tx.id !== id);
      const newCache = { ...state.cache, [selectedDateKey]: updated };
      updateTrendFn(selectedDateKey, newCache, set);
      return {
        transactions: updated,
        cache: newCache,
      };
    });
  },

  goToPrevDay: async () => {
    const { selectedDateKey } = get();
    const prev = addDays(selectedDateKey, -1);
    await get().loadForDate(prev);
  },

  goToNextDay: async () => {
    const { selectedDateKey } = get();
    const next = addDays(selectedDateKey, 1);
    await get().loadForDate(next);
  },

  isToday: () => {
    const { selectedDateKey } = get();
    return selectedDateKey === getTodayDateKey();
  },
}));
