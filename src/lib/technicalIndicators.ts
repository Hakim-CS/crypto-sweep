
import { ChartData } from './types';

export function calculateRSI(prices: number[], periods: number = 14): number[] {
  if (prices.length < periods) {
    return Array(prices.length).fill(0);
  }

  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  let gains = changes.map(change => change > 0 ? change : 0);
  let losses = changes.map(change => change < 0 ? -change : 0);

  // Calculate average gain and loss
  const avgGain = gains.slice(0, periods).reduce((a, b) => a + b) / periods;
  const avgLoss = losses.slice(0, periods).reduce((a, b) => a + b) / periods;

  if (avgLoss === 0) {
    return Array(prices.length).fill(100);
  }

  let rs = avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  const rsiValues = [0, ...Array(periods - 1).fill(0), rsi];

  // Calculate RSI for remaining periods
  for (let i = periods + 1; i < prices.length; i++) {
    const gain = changes[i - 1] > 0 ? changes[i - 1] : 0;
    const loss = changes[i - 1] < 0 ? -changes[i - 1] : 0;

    const avgGain = (gains[i - 2] * 13 + gain) / 14;
    const avgLoss = (losses[i - 2] * 13 + loss) / 14;

    gains[i - 1] = avgGain;
    losses[i - 1] = avgLoss;

    rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    rsiValues.push(rsi);
  }

  return rsiValues;
}

export function calculateSMA(prices: number[], periods: number = 20): number[] {
  const sma = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < periods - 1) {
      sma.push(0);
      continue;
    }
    const sum = prices.slice(i - periods + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / periods);
  }
  return sma;
}

export function calculateEMA(prices: number[], periods: number = 20): number[] {
  const multiplier = 2 / (periods + 1);
  const ema = [prices[0]];

  for (let i = 1; i < prices.length; i++) {
    const value = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
    ema.push(value);
  }

  return ema;
}

export function getIndicatorInterpretation(rsi: number): 'bullish' | 'bearish' | 'neutral' {
  if (rsi > 70) return 'bearish';
  if (rsi < 30) return 'bullish';
  return 'neutral';
}
