export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  history: Array<{
    date: string;
    price: number;
  }>;
  news: Array<{
    title: string;
    summary: string;
    url: string;
    source: string;
    time: string;
  }>;
  sentiment: {
    score: number; // -1 to 1
    label: 'Bullish' | 'Bearish' | 'Neutral';
    analysis: string;
  };
}
