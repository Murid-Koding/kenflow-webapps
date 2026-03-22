import { useEffect, useRef } from 'react';
import { useExpenseStore } from '../store/expenseStore';

export function InputBar() {
  const { input, setInput, addFromInput } = useExpenseStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFromInput();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        type="text"
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="type: 'coffee 15k' then press enter"
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </form>
  );
}
