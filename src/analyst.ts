import { DataRow, DataStats } from './types';

export function analyzeData(data: DataRow[]): DataStats {
  if (data.length === 0) {
    return {
      numCols: [],
      catCols: [],
      dateCols: [],
      missingPct: 0,
      insights: [],
      shape: [0, 0],
      summary: {},
      cardinality: {},
      forecasts: {},
    };
  }

  const columns = Object.keys(data[0]);
  const numRows = data.length;
  const numColsCount = columns.length;

  const numCols: string[] = [];
  const catCols: string[] = [];
  const dateCols: string[] = [];
  const summary: DataStats['summary'] = {};
  const cardinality: Record<string, number> = {};
  const forecasts: Record<string, { date: string, value: number }[]> = {};

  columns.forEach(col => {
    const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(values);
    cardinality[col] = uniqueValues.size;

    // Check if numeric
    const isNumeric = values.every(v => !isNaN(Number(v)));
    // Check if date-like
    const isDate = col.toLowerCase().match(/date|time|year|month|day/);

    if (isNumeric && values.length > 0) {
      numCols.push(col);
      const numValues = values.map(v => Number(v));
      const sorted = [...numValues].sort((a, b) => a - b);
      const mean = numValues.reduce((a, b) => a + b, 0) / numValues.length;
      const sqDiffs = numValues.map(v => Math.pow(v - mean, 2));
      const std = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / numValues.length);
      
      summary[col] = {
        mean,
        std,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        q1: sorted[Math.floor(sorted.length * 0.25)],
        median: sorted[Math.floor(sorted.length * 0.5)],
        q3: sorted[Math.floor(sorted.length * 0.75)],
        count: values.length,
        missing: numRows - values.length,
      };

    } else if (isDate) {
      dateCols.push(col);
    } else {
      catCols.push(col);
    }
  });

  // Simple Forecasting for numeric columns if date column exists
  if (dateCols.length > 0 && numCols.length > 0) {
    const dateCol = dateCols[0];
    numCols.forEach(numCol => {
      const timeSeries = data
        .map(r => ({ date: new Date(String(r[dateCol])), value: Number(r[numCol]) }))
        .filter(d => !isNaN(d.date.getTime()) && !isNaN(d.value))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      if (timeSeries.length > 5) {
        // Simple Linear Regression: y = mx + b
        const n = timeSeries.length;
        const x = timeSeries.map((_, i) => i);
        const y = timeSeries.map(d => d.value);
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
        const sumXX = x.reduce((acc, val) => acc + val * val, 0);
        
        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const b = (sumY - m * sumX) / n;
        
        const lastDate = timeSeries[timeSeries.length - 1].date;
        const forecast = [];
        for (let i = 1; i <= 5; i++) {
          const nextDate = new Date(lastDate);
          nextDate.setDate(nextDate.getDate() + i);
          forecast.push({
            date: nextDate.toISOString().split('T')[0],
            value: m * (n + i - 1) + b
          });
        }
        forecasts[numCol] = forecast;
      }
    });
  }

  const totalCells = numRows * numColsCount;
  const missingCells = columns.reduce((acc, col) => {
    return acc + data.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
  }, 0);
  const missingPct = (missingCells / totalCells) * 100;

  const insights: string[] = [];

  // Logic from analyst.py
  columns.forEach(col => {
    const missing = data.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
    if (missing > numRows * 0.2) {
      insights.push(`Column <b>${col}</b> has >20% missing values.`);
    }
  });

  numCols.forEach(col => {
    const values = data.map(row => Number(row[col])).filter(v => !isNaN(v));
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const currentIqr = q3 - q1;
    const outliers = values.filter(v => v < q1 - 1.5 * currentIqr || v > q3 + 1.5 * currentIqr);
    if (outliers.length > numRows * 0.05) {
      insights.push(`Column <b>${col}</b> has a high concentration of outliers (${outliers.length}).`);
    }
  });

  catCols.forEach(col => {
    if (cardinality[col] > 50) {
      insights.push(`Column <b>${col}</b> has high cardinality (${cardinality[col]} unique values).`);
    }
  });

  if (insights.length === 0) {
    insights.push("Data looks clean — no major quality issues detected.");
  }

  return {
    numCols,
    catCols,
    dateCols,
    missingPct,
    insights,
    shape: [numRows, numColsCount],
    summary,
    cardinality,
    forecasts,
  };
}

export type CleaningAction = 
  | { type: 'remove_outliers', column: string }
  | { type: 'clip_outliers', column: string }
  | { type: 'group_cardinality', column: string, topN: number }
  | { type: 'impute_missing', column: string, method: 'mean' | 'median' | 'mode' }
  | { type: 'drop_missing', column: string };

export function cleanData(data: DataRow[], action: CleaningAction): DataRow[] {
  const { type, column } = action;
  
  if (type === 'remove_outliers') {
    const values = data.map(r => Number(r[column])).filter(v => !isNaN(v));
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    return data.filter(r => {
      const v = Number(r[column]);
      return isNaN(v) || (v >= lower && v <= upper);
    });
  }

  if (type === 'clip_outliers') {
    const values = data.map(r => Number(r[column])).filter(v => !isNaN(v));
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    return data.map(r => {
      const v = Number(r[column]);
      if (isNaN(v)) return r;
      return { ...r, [column]: Math.min(Math.max(v, lower), upper) };
    });
  }

  if (type === 'group_cardinality') {
    const counts: Record<string, number> = {};
    data.forEach(r => {
      const val = String(r[column]);
      counts[val] = (counts[val] || 0) + 1;
    });
    const topValues = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, action.topN)
      .map(e => e[0]);
    
    return data.map(r => ({
      ...r,
      [column]: topValues.includes(String(r[column])) ? r[column] : 'Other'
    }));
  }

  if (type === 'impute_missing') {
    const values = data.map(r => r[column]).filter(v => v !== null && v !== undefined && v !== '');
    let fillValue: any;
    
    if (action.method === 'mode') {
      const counts: Record<string, number> = {};
      values.forEach(v => { counts[String(v)] = (counts[String(v)] || 0) + 1; });
      fillValue = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    } else {
      const numValues = values.map(v => Number(v)).filter(v => !isNaN(v));
      if (action.method === 'mean') {
        fillValue = numValues.reduce((a, b) => a + b, 0) / numValues.length;
      } else {
        const sorted = [...numValues].sort((a, b) => a - b);
        fillValue = sorted[Math.floor(sorted.length * 0.5)];
      }
    }

    return data.map(r => {
      if (r[column] === null || r[column] === undefined || r[column] === '') {
        return { ...r, [column]: fillValue };
      }
      return r;
    });
  }

  if (type === 'drop_missing') {
    return data.filter(r => r[column] !== null && r[column] !== undefined && r[column] !== '');
  }

  return data;
}

export function professionalAutoClean(data: DataRow[]): DataRow[] {
  if (data.length === 0) return data;

  const columns = Object.keys(data[0]);
  let cleaned = [...data];

  // 1. Remove Duplicate Rows
  const seen = new Set();
  cleaned = cleaned.filter(row => {
    const serialized = JSON.stringify(row);
    if (seen.has(serialized)) return false;
    seen.add(serialized);
    return true;
  });

  // 2. Initial Analysis to identify column types
  const stats = analyzeData(cleaned);

  // 3. Process each column
  columns.forEach(col => {
    const isNum = stats.numCols.includes(col);
    const isCat = stats.catCols.includes(col);

    cleaned = cleaned.map(row => {
      let val = row[col];

      // Standardize Strings
      if (typeof val === 'string') {
        val = val.trim();
        // If it's a category, normalize case for consistency
        if (isCat) {
          // We don't lowercase everything as it might lose meaning (e.g. Brand names)
          // but we do trim.
        }
      }

      // Ensure Numeric types are actually numbers
      if (isNum && val !== null && val !== undefined && val !== '') {
        const num = Number(val);
        if (!isNaN(num)) val = num;
      }

      return { ...row, [col]: val };
    });

    // 4. Impute Missing Values
    const values = cleaned.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length < cleaned.length) {
      let fillValue: any;
      if (isNum) {
        const numValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        const sorted = [...numValues].sort((a, b) => a - b);
        fillValue = sorted[Math.floor(sorted.length * 0.5)]; // Median is more robust than mean
      } else {
        const counts: Record<string, number> = {};
        values.forEach(v => { counts[String(v)] = (counts[String(v)] || 0) + 1; });
        const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        fillValue = sortedCounts.length > 0 ? sortedCounts[0][0] : '';
      }

      cleaned = cleaned.map(r => {
        if (r[col] === null || r[col] === undefined || r[col] === '') {
          return { ...r, [col]: fillValue };
        }
        return r;
      });
    }

    // 5. Clip Outliers for Numeric Columns (Winsorization)
    if (isNum) {
      const numValues = cleaned.map(r => Number(r[col])).filter(v => !isNaN(v));
      const sorted = [...numValues].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;

      cleaned = cleaned.map(r => {
        const v = Number(r[col]);
        if (isNaN(v)) return r;
        return { ...r, [col]: Math.min(Math.max(v, lower), upper) };
      });
    }

    // 6. Group High Cardinality
    if (isCat && stats.cardinality[col] > 20) {
      const counts: Record<string, number> = {};
      cleaned.forEach(r => {
        const val = String(r[col]);
        counts[val] = (counts[val] || 0) + 1;
      });
      const topValues = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(e => e[0]);
      
      cleaned = cleaned.map(r => ({
        ...r,
        [col]: topValues.includes(String(r[col])) ? r[col] : 'Other'
      }));
    }
  });

  return cleaned;
}

export function getCorrelation(data: DataRow[], colA: string, colB: string): number {
  const valsA = data.map(r => Number(r[colA])).filter(v => !isNaN(v));
  const valsB = data.map(r => Number(r[colB])).filter(v => !isNaN(v));
  
  if (valsA.length !== valsB.length || valsA.length === 0) return 0;

  const meanA = valsA.reduce((a, b) => a + b, 0) / valsA.length;
  const meanB = valsB.reduce((a, b) => a + b, 0) / valsB.length;

  let num = 0;
  let denA = 0;
  let denB = 0;

  for (let i = 0; i < valsA.length; i++) {
    const diffA = valsA[i] - meanA;
    const diffB = valsB[i] - meanB;
    num += diffA * diffB;
    denA += diffA * diffA;
    denB += diffB * diffB;
  }

  return num / Math.sqrt(denA * denB);
}
