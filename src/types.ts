export interface DataStats {
  numCols: string[];
  catCols: string[];
  dateCols: string[];
  missingPct: number;
  insights: string[];
  shape: [number, number];
  summary: Record<string, {
    mean: number;
    std: number;
    min: number;
    max: number;
    q1: number;
    median: number;
    q3: number;
    count: number;
    missing: number;
  }>;
  cardinality: Record<string, number>;
  forecasts: Record<string, { date: string, value: number }[]>;
}

export interface DataRow {
  [key: string]: any;
}
