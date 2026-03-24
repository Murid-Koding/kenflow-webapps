import { useEffect, useState } from "react";
import { useExpenseStore, getDateLabel } from "../store/expenseStore";
import { exportData, getExportCount } from "../utils/dataTransfer";

export function Header() {
  const { selectedDateKey, isToday, goToPrevDay, goToNextDay } =
    useExpenseStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcInput, setCalcInput] = useState("0");
  const [calcError, setCalcError] = useState<string | null>(null);
  const modalTitleId = "export-confirm-title";
  const modalDescId = "export-confirm-desc";
  const calcModalTitleId = "quick-calc-title";
  const calcModalDescId = "quick-calc-desc";

  const label = getDateLabel(selectedDateKey);
  const today = isToday();

  const resetCalculator = () => {
    setCalcInput("0");
    setCalcError(null);
  };

  const openCalculator = () => {
    resetCalculator();
    setIsConfirmOpen(false);
    setIsCalcOpen(true);
  };

  const closeCalculator = () => {
    setIsCalcOpen(false);
    setCalcError(null);
  };

  useEffect(() => {
    if (!isCalcOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCalculator();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isCalcOpen]);

  const appendDigit = (digit: string) => {
    setCalcError(null);
    setCalcInput((prev) => {
      if (prev === "0" && digit !== ".") {
        return digit;
      }
      if (digit === ".") {
        const segments = prev.split(/[-+×÷]/);
        const lastSegment = segments[segments.length - 1] ?? "";
        if (lastSegment.includes(".")) {
          return prev;
        }
        return `${prev}${digit}`;
      }
      return prev ? `${prev}${digit}` : digit;
    });
  };

  const appendOperator = (operator: string) => {
    setCalcError(null);
    setCalcInput((prev) => {
      if (!prev || prev === "0") {
        return operator === "-" ? operator : `0${operator}`;
      }
      let next = prev;
      if (next.endsWith(".")) {
        next = next.slice(0, -1);
      }
      if (/[-+×÷]$/.test(next)) {
        return `${next.slice(0, -1)}${operator}`;
      }
      return `${next}${operator}`;
    });
  };

  const handleCalcBackspace = () => {
    setCalcError(null);
    setCalcInput((prev) => {
      if (prev.length <= 1) return "0";
      const sliced = prev.slice(0, -1);
      return sliced === "" ? "0" : sliced;
    });
  };

  const handleCalcClear = () => {
    resetCalculator();
  };

  const evaluateCalc = () => {
    setCalcError(null);
    try {
      let expression = calcInput;
      if (/[-+×÷.]$/.test(expression)) {
        expression = expression.slice(0, -1);
      }
      if (!expression || expression === "-") {
        return;
      }
      const sanitized = expression.replace(/×/g, "*").replace(/÷/g, "/");
      const result = Function(`"use strict"; return (${sanitized});`)();
      if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
        throw new Error("invalid");
      }
      const rounded = Math.round(result * 1_000_000) / 1_000_000;
      setCalcInput(rounded.toString());
    } catch {
      setCalcError("Ekspresi tidak valid");
    }
  };

  const handleCalcInput = (value: string) => {
    if (/^[0-9]$/.test(value)) {
      appendDigit(value);
      return;
    }
    if (value === ".") {
      appendDigit(value);
      return;
    }
    if (value === "=") {
      evaluateCalc();
      return;
    }
    appendOperator(value);
  };

  const handleExportClick = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      setIsCalcOpen(false);
      setCalcError(null);
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
      setIsCalcOpen(false);
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

  const keypadLayout = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
  ];

  return (
    <div className="pt-6 pb-2 relative">
      <div className="absolute right-0 -top-3 flex gap-2">
        <button
          onClick={openCalculator}
          disabled={isExporting}
          className={`w-10 h-10 flex items-center justify-center text-gray-400 transition-transform transition-colors duration-200 focus-visible:outline-none ${
            isExporting
              ? "opacity-50 cursor-wait"
              : "hover:text-gray-800 hover:scale-110 focus-visible:text-gray-800 focus-visible:scale-110"
          }`}
          aria-label="Buka kalkulator"
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
            aria-hidden="true"
          >
            <rect x="6" y="4" width="12" height="16" rx="2" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <circle cx="9" cy="12" r="0.8" />
            <circle cx="12" cy="12" r="0.8" />
            <circle cx="15" cy="12" r="0.8" />
            <circle cx="9" cy="15" r="0.8" />
            <circle cx="12" cy="15" r="0.8" />
            <circle cx="15" cy="15" r="0.8" />
          </svg>
        </button>
        <button
          onClick={handleExportClick}
          disabled={isExporting}
          className={`w-10 h-10 flex items-center justify-center text-gray-400 transition-transform transition-colors duration-200 focus-visible:outline-none ${
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
      </div>

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
      {isCalcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#fffbf5]/80 backdrop-blur-[2px]"
            onClick={closeCalculator}
          />
          <div
            className="relative w-full max-w-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={calcModalTitleId}
            aria-describedby={calcModalDescId}
          >
            <div className="relative overflow-hidden rounded-[28px] border-[2.5px] border-gray-900 bg-[#fffef9] p-6 text-gray-900 shadow-[-6px_6px_0_0_rgba(17,24,39,0.25)] doodle-surface">
              <span className="doodle-scribble doodle-scribble--peach" aria-hidden="true" />
              <span className="doodle-scribble doodle-scribble--mint" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-[1.8px] border-gray-900 bg-white text-xl shadow-[3px_3px_0_rgba(17,24,39,0.25)]">
                  🧮
                </div>
                <div>
                  <h2
                    id={calcModalTitleId}
                    className="text-lg font-semibold tracking-tight"
                  >
                    Kalkulator cepat
                  </h2>
                  <span className="mt-1 inline-flex w-fit items-center rounded-full border border-gray-900 bg-white/80 px-3 text-[11px] font-medium uppercase tracking-[0.25em] text-gray-700">
                    helper
                  </span>
                </div>
              </div>
              <p
                id={calcModalDescId}
                className="mt-3 text-sm leading-relaxed text-gray-700"
              >
                Hitung skenario pengeluaran tanpa meninggalkan halaman ini.
              </p>
              <div className="doodle-calc-display mt-4">
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  ekspresi
                </span>
                <p className="text-2xl font-semibold text-gray-900 break-all">
                  {calcInput}
                </p>
                {calcError && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {calcError}
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleCalcClear}
                  className="doodle-key doodle-key--ghost flex-1"
                >
                  C
                </button>
                <button
                  onClick={handleCalcBackspace}
                  className="doodle-key doodle-key--ghost flex-1"
                >
                  ⌫
                </button>
              </div>
              <div className="doodle-calc-grid mt-4">
                {keypadLayout.map((row, rowIndex) =>
                  row.map((key, colIndex) => {
                    const isOperator = ["+", "-", "×", "÷"].includes(key);
                    const isEqual = key === "=";
                    return (
                      <button
                        key={`${key}-${rowIndex}-${colIndex}`}
                        onClick={() => handleCalcInput(key)}
                        className={`doodle-key ${
                          isEqual
                            ? "doodle-key--equal"
                            : isOperator
                            ? "doodle-key--operator"
                            : ""
                        }`}
                      >
                        {key}
                      </button>
                    );
                  }),
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeCalculator}
                  className="doodle-button bg-gray-900 text-white px-5 py-2 text-sm"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
