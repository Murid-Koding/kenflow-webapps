import { formatAmount } from '../store/expenseStore';

interface SummaryCardProps {
  total: number;
  trend?: string | null;
  onDetail?: () => void;
}

export function SummaryCard({ total, trend, onDetail }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-300 shadow-sm bg-white px-5 py-6 mt-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">total spent</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatAmount(total)}
          </p>
          {trend && (
            <p className="text-xs text-gray-400 mt-2">{trend}</p>
          )}
        </div>
        {onDetail && (
          <button
            onClick={onDetail}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Detail →
          </button>
        )}
      </div>
    </div>
  );
}
