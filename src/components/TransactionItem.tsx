import { formatAmount } from '../store/expenseStore';
import type { Transaction } from '../db/transactionDb';

interface TransactionItemProps {
  tx: Transaction;
  onRemove: (id: number) => void;
}

export function TransactionItem({ tx, onRemove }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-gray-700 capitalize">{tx.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-900">
          {formatAmount(tx.amount)}
        </span>
        <button
          onClick={() => tx.id !== undefined && onRemove(tx.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Remove transaction"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
