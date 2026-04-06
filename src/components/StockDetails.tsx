import { StockData } from "../types/stock";
import { TrendingUp, TrendingDown, Info, Newspaper, BrainCircuit } from "lucide-react";
import { cn } from "../lib/utils";

interface StockDetailsProps {
  data: StockData;
}

export function StockDetails({ data }: StockDetailsProps) {
  const isPositive = data.change >= 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open", value: `$${data.open.toLocaleString()}` },
          { label: "High", value: `$${data.high.toLocaleString()}` },
          { label: "Low", value: `$${data.low.toLocaleString()}` },
          { label: "Volume", value: data.volume.toLocaleString() },
          { label: "Market Cap", value: data.marketCap },
          { label: "P/E Ratio", value: data.peRatio.toFixed(2) },
          { label: "Div Yield", value: `${(data.dividendYield * 100).toFixed(2)}%` },
          { label: "Symbol", value: data.symbol.toUpperCase() },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-lg font-medium text-gray-100">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* AI Sentiment Analysis */}
      <div className="p-6 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <BrainCircuit size={80} className="text-indigo-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit size={20} className="text-indigo-400" />
            <h3 className="text-sm font-mono text-indigo-400 uppercase tracking-widest">AI Sentiment Analysis</h3>
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter",
              data.sentiment.label === 'Bullish' ? "bg-emerald-500/20 text-emerald-400" :
              data.sentiment.label === 'Bearish' ? "bg-red-500/20 text-red-400" :
              "bg-gray-500/20 text-gray-400"
            )}>
              {data.sentiment.label}
            </span>
            <span className="text-xs text-gray-500 font-mono">Score: {data.sentiment.score.toFixed(2)}</span>
          </div>
          <p className="text-gray-300 leading-relaxed text-sm italic">
            "{data.sentiment.analysis}"
          </p>
        </div>
      </div>

      {/* News Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Newspaper size={18} className="text-gray-400" />
          <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest">Latest Market News</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {data.news.map((item, i) => (
            <a 
              key={i} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-5 bg-gray-900/30 border border-gray-800 rounded-xl hover:border-gray-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">{item.source}</span>
                <span className="text-[10px] font-mono text-gray-600">{item.time}</span>
              </div>
              <h4 className="text-gray-100 font-medium mb-2 group-hover:text-indigo-300 transition-colors">{item.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-2">{item.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
