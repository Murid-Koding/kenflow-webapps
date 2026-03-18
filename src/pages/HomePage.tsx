import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenseStore, getDateLabel } from '../store/expenseStore';
import { Header } from '../components/Header';
import { SummaryCard } from '../components/SummaryCard';
import { InputBar } from '../components/InputBar';
import { TransactionItem } from '../components/TransactionItem';

export function HomePage() {
  const navigate = useNavigate();
  const {
    transactions,
    isLoading,
    selectedDateKey,
    trendText,
    loadForDate,
    removeTransaction,
  } = useExpenseStore();

  useEffect(() => {
    loadForDate(selectedDateKey);
  }, []);

  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const dateLabel = getDateLabel(selectedDateKey);

  const handleDetail = () => {
    const [year, month] = selectedDateKey.split('-').map(Number);
    navigate(`/evaluation/${year}/${month}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[420px] px-4 py-6 flex flex-col gap-5">
        <Header />
        <SummaryCard total={total} trend={trendText} onDetail={handleDetail} />
        <InputBar />

        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}{' '}
            · {dateLabel}
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No expenses yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                onRemove={removeTransaction}
              />
            ))}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
