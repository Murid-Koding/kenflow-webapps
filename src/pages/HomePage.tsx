import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Reorder } from "framer-motion";
import { useExpenseStore, getDateLabel } from "../store/expenseStore";
import { Header } from "../components/Header";
import { SummaryCard } from "../components/SummaryCard";
import { InputBar } from "../components/InputBar";
import { TransactionItem } from "../components/TransactionItem";
import { importDataFromFile } from "../utils/dataTransfer";

export function HomePage() {
  const navigate = useNavigate();
  const {
    transactions,
    isLoading,
    selectedDateKey,
    trendText,
    loadForDate,
    removeTransaction,
    reorderTransactions,
    refreshAfterImport,
  } = useExpenseStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadForDate(selectedDateKey);
  }, []);

  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const dateLabel = getDateLabel(selectedDateKey);

  const handleDetail = () => {
    const [year, month] = selectedDateKey.split("-").map(Number);
    navigate(`/evaluation/${year}/${month}`);
  };

  const handleImportTrigger = () => {
    if (isImporting) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    if (
      !window.confirm(
        "Import data akan menggantikan seluruh catatan saat ini. Lanjutkan?",
      )
    ) {
      input.value = "";
      return;
    }
    try {
      setIsImporting(true);
      const count = await importDataFromFile(file);
      await refreshAfterImport();
      alert(`Berhasil mengimpor ${count} transaksi.`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Gagal mengimpor data.";
      alert(message);
    } finally {
      setIsImporting(false);
      input.value = "";
    }
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
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""} · {dateLabel}
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
          <Reorder.Group
            axis="y"
            values={transactions}
            onReorder={reorderTransactions}
            className="flex flex-col gap-2"
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {transactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                tx={tx}
                onRemove={removeTransaction}
              />
            ))}
          </Reorder.Group>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="mt-24 flex justify-center">
          <button
            type="button"
            onClick={handleImportTrigger}
            disabled={isImporting}
            className={`inline-flex items-center gap-2 text-sm lowercase text-gray-900/25 transition ${
              isImporting ? 'cursor-wait' : 'hover:text-gray-900/60'
            }`}
            aria-label="Import data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v9" />
              <path d="M8 10l4 4 4-4" />
              <path d="M6 18h12" />
            </svg>
            {isImporting ? "importing" : "import data"}
          </button>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
