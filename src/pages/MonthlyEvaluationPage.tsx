import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransactionsByMonth } from '../db/transactionDb';
import { formatAmount } from '../store/expenseStore';

interface DayStat {
  dateKey: string;
  label: string;
  total: number;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getMonthName(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
  });
}

export function MonthlyEvaluationPage() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);
  const [hariBoros, setHariBoros] = useState<DayStat | null>(null);
  const [hariHemat, setHariHemat] = useState<DayStat | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const y = parseInt(year ?? '0', 10);
      const m = parseInt(month ?? '0', 10);
      if (!y || !m) {
        setIsLoading(false);
        return;
      }

      const txs = await getTransactionsByMonth(y, m);
      const totalSpend = txs.reduce((s, tx) => s + tx.amount, 0);

      const byDay: Record<string, number> = {};
      for (const tx of txs) {
        byDay[tx.dateKey] = (byDay[tx.dateKey] ?? 0) + tx.amount;
      }

      const days = Object.entries(byDay).map(([dateKey, amt]) => ({
        dateKey,
        label: formatDateLabel(dateKey),
        total: amt,
      }));

      days.sort((a, b) => b.total - a.total);

      const boros = days[0] ?? null;
      const hemat = days[days.length - 1] ?? null;

      const daysInMonth = getDaysInMonth(y, m);
      const avg = Math.round(totalSpend / daysInMonth);

      setTotal(totalSpend);
      setAvgPerDay(avg);
      setHariBoros(boros);
      setHariHemat(hemat);
      setIsLoading(false);
    }

    load();
  }, [year, month]);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[420px] px-4 py-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label="Kembali"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            {year && month ? getMonthName(parseInt(year), parseInt(month)) : 'Evaluasi'}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-gray-300 shadow-sm bg-white px-5 py-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatAmount(total)}</p>
            </div>

            <div className="rounded-2xl border border-gray-300 shadow-sm bg-white px-5 py-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Rata-rata per hari</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatAmount(avgPerDay)}</p>
            </div>

            {hariBoros && (
              <div className="rounded-2xl border border-gray-300 shadow-sm bg-white px-5 py-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Hari paling boros</p>
                <p className="text-sm font-medium text-gray-700 mt-1 capitalize">
                  {hariBoros.label}
                </p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{formatAmount(hariBoros.total)}</p>
              </div>
            )}

            {hariHemat && (
              <div className="rounded-2xl border border-gray-300 shadow-sm bg-white px-5 py-5">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Hari paling hemat</p>
                <p className="text-sm font-medium text-gray-700 mt-1 capitalize">
                  {hariHemat.label}
                </p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{formatAmount(hariHemat.total)}</p>
              </div>
            )}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
