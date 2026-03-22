import { Reorder, useDragControls } from "framer-motion";
import { formatAmount } from "../store/expenseStore";
import type { Transaction } from "../db/transactionDb";

interface TransactionItemProps {
  tx: Transaction;
  onRemove: (id: number) => void;
}

function GripIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

export function TransactionItem({ tx, onRemove }: TransactionItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={tx}
      dragListener={false}
      dragControls={controls}
      style={{ listStyle: "none" }}
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm select-none"
      whileDrag={{
        scale: 1.025,
        boxShadow: "0 8px 28px rgba(0, 0, 0, 0.10)",
        borderColor: "rgba(209, 213, 219, 0.6)",
        zIndex: 50,
      }}
      transition={{ duration: 0.15 }}
    >
      {/* Drag handle */}
      <div
        onPointerDown={(e) => controls.start(e)}
        className="touch-none cursor-grab active:cursor-grabbing mr-3 text-gray-300 hover:text-gray-400 transition-colors shrink-0"
        aria-label="Drag to reorder"
      >
        <GripIcon />
      </div>

      {/* Transaction name */}
      <span className="flex-1 text-sm font-medium text-gray-700 capitalize truncate">
        {tx.name}
      </span>

      {/* Amount + remove */}
      <div className="flex items-center gap-3 ml-2 shrink-0">
        <span className="text-sm font-semibold text-gray-900">
          {formatAmount(tx.amount)}
        </span>
        <button
          onClick={() => tx.id !== undefined && onRemove(tx.id)}
          className="text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Remove transaction"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </Reorder.Item>
  );
}
