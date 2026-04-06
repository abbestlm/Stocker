import { GoogleGenAI, Type } from "@google/genai";
import { StockData } from "../types/stock";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey! });

export async function fetchStockData(symbol: string): Promise<StockData> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Fetch real-time (or latest available) stock information for ticker symbol "${symbol}". 
    Include:
    - Current price, change, change percent, high, low, open, volume, market cap, PE ratio, dividend yield.
    - Historical price data for the last 30 days (daily close prices).
    - Latest 3 relevant news articles with title, summary, url, source, and time.
    - A brief sentiment analysis (score -1 to 1, label, and analysis text).
    
    Return the data as a JSON object matching the following structure:
    {
      "symbol": string,
      "name": string,
      "price": number,
      "change": number,
      "changePercent": number,
      "high": number,
      "low": number,
      "open": number,
      "volume": number,
      "marketCap": string,
      "peRatio": number,
      "dividendYield": number,
      "history": [{"date": "YYYY-MM-DD", "price": number}],
      "news": [{"title": string, "summary": string, "url": string, "source": string, "time": string}],
      "sentiment": {"score": number, "label": "Bullish" | "Bearish" | "Neutral", "analysis": string}
    }`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING },
          name: { type: Type.STRING },
          price: { type: Type.NUMBER },
          change: { type: Type.NUMBER },
          changePercent: { type: Type.NUMBER },
          high: { type: Type.NUMBER },
          low: { type: Type.NUMBER },
          open: { type: Type.NUMBER },
          volume: { type: Type.NUMBER },
          marketCap: { type: Type.STRING },
          peRatio: { type: Type.NUMBER },
          dividendYield: { type: Type.NUMBER },
          history: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                price: { type: Type.NUMBER }
              },
              required: ["date", "price"]
            }
          },
          news: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                url: { type: Type.STRING },
                source: { type: Type.STRING },
                time: { type: Type.STRING }
              },
              required: ["title", "summary", "url", "source", "time"]
            }
          },
          sentiment: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              label: { type: Type.STRING },
              analysis: { type: Type.STRING }
            },
            required: ["score", "label", "analysis"]
          }
        },
        required: [
          "symbol", "name", "price", "change", "changePercent", "high", "low", "open", 
          "volume", "marketCap", "peRatio", "dividendYield", "history", "news", "sentiment"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to fetch stock data");
  return JSON.parse(text) as StockData;
}
