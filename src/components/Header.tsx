import { useState } from "react";
import { useExpenseStore, getDateLabel } from "../store/expenseStore";
import { exportData } from "../utils/dataTransfer";

export function Header() {
  const { selectedDateKey, isToday, goToPrevDay, goToNextDay } =
    useExpenseStore();
  const [isExporting, setIsExporting] = useState(false);

  const label = getDateLabel(selectedDateKey);
  const today = isToday();

  const handleExport = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      await exportData();
    } catch (err) {
      console.error(err);
      alert("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pt-6 pb-2 relative">
      <button
        onClick={handleExport}
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
    </div>
  );
}
