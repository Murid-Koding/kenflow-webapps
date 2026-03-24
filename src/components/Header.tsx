import { useState } from "react";
import { useExpenseStore, getDateLabel } from "../store/expenseStore";
import { exportData, getExportCount } from "../utils/dataTransfer";

export function Header() {
  const { selectedDateKey, isToday, goToPrevDay, goToNextDay } =
    useExpenseStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const modalTitleId = "export-confirm-title";
  const modalDescId = "export-confirm-desc";

  const label = getDateLabel(selectedDateKey);
  const today = isToday();

  const handleExportClick = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const count = await getExportCount();
      if (count === 0) {
        alert("Belum ada data untuk diekspor.");
        return;
      }
      setIsConfirmOpen(true);
    } catch (err) {
      console.error(err);
      alert("Gagal memeriksa data ekspor.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmExport = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const count = await exportData();
      if (count === 0) {
        alert("Belum ada data untuk diekspor.");
      }
      setIsConfirmOpen(false);
    } catch (err) {
      console.error(err);
      alert("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  const closeModal = () => {
    if (isExporting) return;
    setIsConfirmOpen(false);
  };

  return (
    <div className="pt-6 pb-2 relative">
      <button
        onClick={handleExportClick}
        disabled={isExporting}
        className={`absolute right-0 -top-3 w-10 h-10 flex items-center justify-center text-gray-400 transition-transform transition-colors duration-200 focus-visible:outline-none ${
          isExporting
            ? "opacity-50 cursor-wait"
            : "hover:text-gray-800 hover:scale-110 focus-visible:text-gray-800 focus-visible:scale-110"
        }`}
        aria-label="Export data"
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
        >
          <path d="M12 5v9" />
          <path d="M8 10l4 4 4-4" />
          <path d="M6 18h12" />
        </svg>
      </button>

      <div className="flex items-start justify-between gap-4">
        <button
          onClick={goToPrevDay}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Kemarin"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="text-center flex-1">
          <h1 className="text-xl font-semibold text-gray-900 leading-tight">
            My Expenses
          </h1>
          <p
            className={`text-xs mt-0.5 ${today ? "text-gray-500" : "text-gray-400"}`}
          >
            {label}
            {today && <span className="ml-1 text-gray-300">·</span>}
          </p>
        </div>

        <button
          onClick={goToNextDay}
          disabled={today}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
            today
              ? "text-gray-200 cursor-not-allowed"
              : "text-gray-500 hover:bg-gray-200"
          }`}
          aria-label="Besok"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#fffbf5]/80 backdrop-blur-[2px]"
            onClick={closeModal}
          />
          <div
            className="relative w-full max-w-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescId}
          >
            <div className="relative overflow-hidden rounded-[28px] border-[2.5px] border-gray-900 bg-[#fff8f1] p-6 text-gray-900 shadow-[-6px_6px_0_0_rgba(17,24,39,0.25)] doodle-surface">
              <span className="doodle-scribble doodle-scribble--peach" aria-hidden="true" />
              <span className="doodle-scribble doodle-scribble--mint" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[1.8px] border-gray-900 bg-white text-xl shadow-[3px_3px_0_rgba(17,24,39,0.25)]">
                  📁
                </div>
                <div>
                  <h2
                    id={modalTitleId}
                    className="text-lg font-semibold tracking-tight"
                  >
                    Konfirmasi Ekspor
                  </h2>
                  <span className="mt-1 inline-flex w-fit items-center rounded-full border border-gray-900 bg-white/80 px-3 text-[11px] font-medium uppercase tracking-[0.25em] text-gray-700">
                    JSON FILE
                  </span>
                </div>
              </div>
              <p
                id={modalDescId}
                className="mt-4 text-sm leading-relaxed text-gray-700"
              >
                Kami akan membuat salinan data pengeluaranmu dalam format JSON.
                Pastikan kamu menyimpannya di tempat aman sebelum melanjutkan.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={closeModal}
                  className="relative flex-1 rounded-full border-2 border-dashed border-gray-900 px-4 py-2 text-sm font-semibold text-gray-700 transition-transform hover:-translate-y-0.5"
                >
                  Batal dulu
                </button>
                <button
                  onClick={handleConfirmExport}
                  disabled={isExporting}
                  className={`relative flex-1 rounded-full px-4 py-2 text-sm font-semibold text-white transition-all ${
                    isExporting
                      ? "cursor-wait bg-gray-400"
                      : "bg-gray-900 shadow-[-4px_4px_0_rgba(17,24,39,0.35)] hover:-translate-y-0.5 hover:shadow-[-2px_6px_0_rgba(17,24,39,0.35)]"
                  }`}
                >
                  {isExporting ? "Mengunduh..." : "Ekspor sekarang"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
