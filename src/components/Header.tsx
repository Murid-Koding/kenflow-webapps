import { useExpenseStore, getDateLabel } from '../store/expenseStore';

export function Header() {
  const { selectedDateKey, isToday, goToPrevDay, goToNextDay } =
    useExpenseStore();

  const label = getDateLabel(selectedDateKey);
  const today = isToday();

  return (
    <div className="pt-6 pb-2">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevDay}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Kemarin"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 leading-tight">My Expenses</h1>
          <p className={`text-xs mt-0.5 ${today ? 'text-gray-500' : 'text-gray-400'}`}>
            {label}
            {today && <span className="ml-1 text-gray-300">·</span>}
          </p>
        </div>

        <button
          onClick={goToNextDay}
          disabled={today}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
            today
              ? 'text-gray-200 cursor-not-allowed'
              : 'text-gray-500 hover:bg-gray-200'
          }`}
          aria-label="Besok"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
