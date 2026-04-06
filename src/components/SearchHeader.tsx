import { Search, TrendingUp, TrendingDown, Activity, Globe } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn } from "../lib/utils";

interface SearchHeaderProps {
  onSearch: (symbol: string) => void;
  isLoading: boolean;
  currentSymbol?: string;
  currentPrice?: number;
  currentChange?: number;
  currentChangePercent?: number;
  name?: string;
}

export function SearchHeader({ 
  onSearch, 
  isLoading, 
  currentSymbol, 
  currentPrice, 
  currentChange, 
  currentChangePercent,
  name
}: SearchHeaderProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim().toUpperCase());
      setQuery("");
    }
  };

  const isPositive = (currentChange || 0) >= 0;

  return (
    <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800 py-4 px-6 mb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo & Current Stock Info */}
        <div className="flex items-center gap-8 w-full md:w-auto">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Activity className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-white uppercase">STOCK FETCHER</h1>
          </div>

          {currentSymbol && (
            <div className="hidden lg:flex items-center gap-6 border-l border-gray-800 pl-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">{name || currentSymbol}</p>
                <p className="text-lg font-bold text-white tracking-tight">{currentSymbol}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white tracking-tight">${currentPrice?.toLocaleString()}</p>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  isPositive ? "text-emerald-400" : "text-red-400"
                )}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{isPositive ? "+" : ""}{currentChange?.toFixed(2)} ({isPositive ? "+" : ""}{currentChangePercent?.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative w-full md:w-96 group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ticker (e.g. AAPL, NVDA, TSLA)..."
            className="w-full bg-gray-900 border border-gray-800 rounded-full py-2.5 pl-12 pr-4 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all group-hover:border-gray-700"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </form>

        {/* Global Market Status (Mock) */}
        <div className="hidden xl:flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>NYSE OPEN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={12} />
            <span>USD/EUR 0.92</span>
          </div>
        </div>
      </div>
    </div>
  );
}
