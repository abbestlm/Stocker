import { useState, useEffect, useCallback } from "react";
import { SearchHeader } from "./components/SearchHeader";
import { StockChart } from "./components/StockChart";
import { StockDetails } from "./components/StockDetails";
import { fetchStockData } from "./lib/gemini";
import { StockData } from "./types/stock";
import { TrendingUp, TrendingDown, Activity, AlertCircle, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";

const DEFAULT_SYMBOL = "NVDA";

export default function App() {
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [data, setData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("watchlist");
    return saved ? JSON.parse(saved) : ["AAPL", "TSLA", "MSFT", "GOOGL"];
  });

  const handleFetch = useCallback(async (targetSymbol: string, force = false) => {
    if (isLoading) return;
    
    // 1. Check Cache First (Fix for 429)
    const cacheKey = `stock_cache_${targetSymbol}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData && !force) {
      const { data: savedData, timestamp } = JSON.parse(cachedData);
      const age = Date.now() - timestamp;
      if (age < 5 * 60 * 1000) { // 5 minutes cache
        console.log(`Loading ${targetSymbol} from cache to prevent 429...`);
        setData(savedData);
        setSymbol(targetSymbol);
        setError(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchStockData(targetSymbol);
      
      // 2. Save to Cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));

      setData(result);
      setSymbol(targetSymbol);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message || "";
      
      if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
        setError("API Limit Reached: You've hit the Gemini free tier quota. Please wait a minute.");
      } else if (errorMessage.includes("400") || errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("expired")) {
        setError("API Key Error: Your Gemini API key is invalid or expired. Please check your GitHub Secrets (GEMINI_API_KEY).");
      } else if (errorMessage.includes("MISSING_API_KEY")) {
        setError("Configuration Error: No API Key found. Make sure you added GEMINI_API_KEY to your GitHub Repository Secrets.");
      } else {
        setError(`Failed to load data for ${targetSymbol}. Please check the symbol and try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch on mount if we don't have data
    if (!data) {
      handleFetch(symbol);
    }
  }, [handleFetch, symbol, data]);

  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (s: string) => {
    setWatchlist(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const isPositive = (data?.change || 0) >= 0;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-indigo-500/30">
      <SearchHeader 
        onSearch={handleFetch} 
        isLoading={isLoading}
        currentSymbol={data?.symbol}
        currentPrice={data?.price}
        currentChange={data?.change}
        currentChangePercent={data?.changePercent}
        name={data?.name}
      />

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Main Chart & Details */}
          <div className="lg:col-span-8 space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400"
              >
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {isLoading && !data ? (
              <div className="h-[500px] flex flex-col items-center justify-center gap-4 bg-gray-900/20 border border-gray-800 rounded-3xl border-dashed">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-mono text-sm animate-pulse tracking-widest uppercase">Analyzing Market Data...</p>
              </div>
            ) : data ? (
              <motion.div 
                key={data.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Chart Section */}
                <div className="p-8 bg-gray-900/40 border border-gray-800 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-bold tracking-tight text-white">{data.name}</h2>
                        <button 
                          onClick={() => toggleWatchlist(data.symbol)}
                          className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-indigo-400"
                        >
                          {watchlist.includes(data.symbol) ? <BookmarkCheck size={20} className="text-indigo-400" /> : <Bookmark size={20} />}
                        </button>
                      </div>
                      <p className="text-sm font-mono text-gray-500 uppercase tracking-widest">{data.symbol} • NASDAQ • USD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-white tracking-tighter">${data.price.toLocaleString()}</p>
                      <div className={cn(
                        "flex items-center justify-end gap-1.5 text-sm font-bold mt-1",
                        isPositive ? "text-emerald-400" : "text-red-400"
                      )}>
                        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>{isPositive ? "+" : ""}{data.change.toFixed(2)} ({isPositive ? "+" : ""}{data.changePercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>

                  <StockChart data={data.history} isPositive={isPositive} />
                </div>

                {/* Details & News */}
                <StockDetails data={data} />
              </motion.div>
            ) : null}
          </div>

          {/* Right Column: Watchlist & Market Overview */}
          <div className="lg:col-span-4 space-y-8">
            {/* Watchlist */}
            <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-3xl">
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-2">
                  <Bookmark size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest">My Watchlist</h3>
                </div>
                <span className="text-[10px] font-mono text-gray-600">{watchlist.length} ITEMS</span>
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {watchlist.map((s) => (
                    <motion.div
                      layout
                      key={s}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-gray-800/50 hover:border-gray-700 transition-all cursor-pointer",
                        symbol === s && "bg-indigo-500/10 border-indigo-500/30"
                      )}
                      onClick={() => handleFetch(s)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                          symbol === s ? "bg-indigo-500 text-white" : "bg-gray-800 text-gray-400 group-hover:bg-gray-700"
                        )}>
                          {s[0]}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{s}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(s);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-gray-600 hover:text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {watchlist.length === 0 && (
                  <div className="py-12 text-center border border-dashed border-gray-800 rounded-2xl">
                    <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">Watchlist is empty</p>
                  </div>
                )}
              </div>
            </div>

            {/* Market Pulse (Mock/Static for design) */}
            <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-3xl">
              <div className="flex items-center gap-2 mb-6 px-1">
                <Activity size={18} className="text-emerald-400" />
                <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest">Market Pulse</h3>
              </div>
              <div className="space-y-6">
                {[
                  { label: "S&P 500", value: "5,137.08", change: "+0.80%", pos: true },
                  { label: "NASDAQ", value: "16,274.94", change: "+1.14%", pos: true },
                  { label: "DOW JONES", value: "38,989.83", change: "-0.12%", pos: false },
                  { label: "BITCOIN", value: "$67,432.10", change: "+4.21%", pos: true },
                ].map((index, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-200">{index.label}</p>
                      <p className="text-[10px] font-mono text-gray-600">INDEXCFD</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-300">{index.value}</p>
                      <p className={cn("text-[10px] font-bold", index.pos ? "text-emerald-400" : "text-red-400")}>
                        {index.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-50">
          <Activity size={16} />
          <span className="text-[10px] font-mono uppercase tracking-widest">Powered by Gemini AI & Real-time Market Data</span>
        </div>
        <div className="flex items-center gap-8 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-400 transition-colors">API Status</a>
        </div>
      </footer>
    </div>
  );
}
