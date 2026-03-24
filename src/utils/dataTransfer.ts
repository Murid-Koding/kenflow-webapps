import {
  getAllTransactions,
  replaceAllTransactions,
  type Transaction,
} from '../db/transactionDb';

interface ExportPayload {
  version: number;
  exportedAt: string;
  items: Transaction[];
}

function buildFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `finance-tracker-data-${year}${month}${day}.json`;
}

async function fetchAllTransactions(): Promise<Transaction[]> {
  return getAllTransactions();
}

export async function getExportCount(): Promise<number> {
  const items = await fetchAllTransactions();
  return items.length;
}

export async function exportData(): Promise<number> {
  const items = await fetchAllTransactions();
  if (items.length === 0) {
    return 0;
  }
  const payload: ExportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = buildFilename();
  anchor.click();
  URL.revokeObjectURL(url);
  return items.length;
}

function sanitizeItems(raw: unknown): Transaction[] {
  if (!Array.isArray(raw)) {
    throw new Error('Format data tidak valid.');
  }

  return raw.map((item) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as Record<string, unknown>).name !== 'string'
    ) {
      throw new Error('Item data tidak valid.');
    }
    const payload = item as Record<string, unknown>;
    const name = String(payload.name).trim();
    const amount = Number(payload.amount);
    const createdAt = Number(payload.createdAt);
    const dateKey = String(payload.dateKey);
    if (!name || !dateKey || !Number.isFinite(amount) || !Number.isFinite(createdAt)) {
      throw new Error('Item data tidak valid.');
    }
    return { name, amount, createdAt, dateKey };
  });
}

export async function importDataFromFile(file: File): Promise<number> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('File bukan JSON yang valid.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Struktur file tidak dikenali.');
  }

  const payload = parsed as { items?: unknown };
  const sanitized = sanitizeItems(payload.items);
  await replaceAllTransactions(sanitized);
  return sanitized.length;
}
