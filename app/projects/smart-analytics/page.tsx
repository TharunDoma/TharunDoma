'use client';

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import { Brain, Upload, BarChart3, Table, FileUp, AlertCircle } from "lucide-react";

type DataRow = Record<string, string | number>;

type ColumnStats = {
  key: string;
  type: 'numeric' | 'text';
  count: number;
  min?: number;
  max?: number;
  mean?: number;
  uniqueValues?: number;
  mostCommon?: string;
  mostCommonCount?: number;
};

function parseCSV(text: string): DataRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: DataRow = {};
    headers.forEach((header, idx) => {
      const raw = (values[idx] || "").trim();
      const num = Number(raw);
      row[header] = Number.isFinite(num) && raw !== "" ? num : raw;
    });
    return row;
  });
}

function computeStats(rows: DataRow[]): ColumnStats[] {
  if (!rows.length) return [];
  const keys = Object.keys(rows[0]);

  return keys.map((key) => {
    const values = rows.map((row) => row[key]);
    const nums = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    
    // Check if column is primarily numeric
    if (nums.length > values.length * 0.5) {
      const sum = nums.reduce((a, b) => a + b, 0);
      return {
        key,
        type: 'numeric' as const,
        count: nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
        mean: sum / nums.length
      };
    }
    
    // Handle text data
    const textValues = values.map(v => String(v)).filter(v => v && v !== 'undefined');
    const uniqueValues = new Set(textValues).size;
    const frequency: Record<string, number> = {};
    textValues.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    const mostCommonEntry = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];
    
    return {
      key,
      type: 'text' as const,
      count: textValues.length,
      uniqueValues,
      mostCommon: mostCommonEntry?.[0],
      mostCommonCount: mostCommonEntry?.[1]
    };
  });
}

function BarVisualization({ rows, stats }: { rows: DataRow[]; stats: ColumnStats[] }) {
  const numericStat = stats.find((s) => s.type === 'numeric');
  const labelKey = Object.keys(rows[0] || {})[0];
  const barDataKey = numericStat?.key || stats[0]?.key;

  if (!barDataKey) return <p className="text-slate-500">No data available.</p>;

  const isNumeric = numericStat !== undefined;

  if (isNumeric) {
    return (
      <div className="grid gap-2">
        {rows.slice(0, 12).map((row, idx) => {
          const value = Number(row[barDataKey]);
          const max = Math.max(...rows.map((r) => Number(r[barDataKey]) || 0));
          const width = max ? Math.round((value / max) * 100) : 0;
          return (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-20 text-xs text-slate-400 truncate">{String(row[labelKey])}</span>
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded h-3 overflow-hidden">
                <div className="bg-red-500 h-full" style={{ width: `${width}%` }} />
              </div>
              <span className="text-xs text-slate-400 w-12 text-right">{value.toFixed(2)}</span>
            </div>
          );
        })}
        <p className="text-xs text-slate-500 mt-3">
          Showing: <span className="text-slate-300">{barDataKey}</span>
        </p>
      </div>
    );
  }

  // For text data, show frequency bars
  const textValues = rows.map(r => String(r[barDataKey]));
  const frequency: Record<string, number> = {};
  textValues.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  const sortedFreq = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const maxCount = Math.max(...sortedFreq.map(([, count]) => count));

  return (
    <div className="grid gap-2">
      {sortedFreq.map(([value, count], idx) => {
        const width = Math.round((count / maxCount) * 100);
        return (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-32 text-xs text-slate-400 truncate">{value}</span>
            <div className="flex-1 bg-slate-900 border border-slate-700 rounded h-3 overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: `${width}%` }} />
            </div>
            <span className="text-xs text-slate-400 w-12 text-right">{count}</span>
          </div>
        );
      })}
      <p className="text-xs text-slate-500 mt-3">
        Frequency of: <span className="text-slate-300">{barDataKey}</span>
      </p>
    </div>
  );
}

function PieVisualization({ rows, stats }: { rows: DataRow[]; stats: ColumnStats[] }) {
  const numericStat = stats.find((s) => s.type === 'numeric');
  const dataKey = numericStat?.key || stats[0]?.key;

  if (!dataKey) return <p className="text-slate-500">No data available.</p>;

  const isNumeric = numericStat !== undefined;
  const colors = ["bg-red-500", "bg-blue-500", "bg-emerald-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500", "bg-orange-500"];

  if (isNumeric) {
    const total = rows.reduce((sum, row) => sum + (Number(row[dataKey]) || 0), 0);
    return (
      <div className="space-y-3">
        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-rose-600" />
        </div>
        <div className="space-y-2">
          {rows.slice(0, 8).map((row, idx) => {
            const value = Number(row[dataKey]) || 0;
            const percentage = total ? ((value / total) * 100).toFixed(1) : "0";
            return (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                <span className="text-slate-400 flex-1 truncate">{String(row[Object.keys(row)[0]])}</span>
                <span className="text-slate-300 font-semibold">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // For text data, show frequency distribution
  const textValues = rows.map(r => String(r[dataKey]));
  const frequency: Record<string, number> = {};
  textValues.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  const sortedFreq = Object.entries(frequency).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const total = sortedFreq.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-center items-center gap-8 mb-4">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-600" />
      </div>
      <div className="space-y-2">
        {sortedFreq.map(([value, count], idx) => {
          const percentage = ((count / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
              <span className="text-slate-400 flex-1 truncate">{value}</span>
              <span className="text-slate-300 font-semibold">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableVisualization({ rows }: { rows: DataRow[] }) {
  if (rows.length === 0) return <p className="text-slate-500">No data to display.</p>;

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto max-h-96 overflow-y-auto">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-slate-800">
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left text-slate-300 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, idx) => (
            <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-slate-400">
                  {typeof row[col] === "number" ? row[col].toFixed(2) : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-500 mt-2 sticky bottom-0 bg-slate-800 py-2">
        Showing {Math.min(50, rows.length)} of {rows.length} rows
      </p>
    </div>
  );
}

export default function SmartAnalyticsPage() {
  const [csvText, setCsvText] = useState("year,sales,profit\n2022,120,20\n2023,180,32\n2024,210,44");
  const [rows, setRows] = useState<DataRow[]>(() => parseCSV("year,sales,profit\n2022,120,20\n2023,180,32\n2024,210,44"));
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "pie" | "table">("bar");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => computeStats(rows), [rows]);

  const handleAnalyze = () => {
    const parsed = parseCSV(csvText);
    if (!parsed.length) {
      setError("Please provide a valid CSV with headers and at least one data row.");
      return;
    }
    setError("");
    setFileName("");
    setRows(parsed);
    generateDescription(parsed, computeStats(parsed));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        setCsvText(text);
        const parsed = parseCSV(text);
        
        if (!parsed.length) {
          setError("Invalid CSV file. Please ensure it has headers and at least one data row.");
          setLoading(false);
          return;
        }

        setRows(parsed);
        const statsData = computeStats(parsed);
        generateDescription(parsed, statsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to read file. Make sure it's a valid CSV file.");
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const generateDescription = async (data: DataRow[], statsData: ColumnStats[]) => {
    if (!statsData.length) return;

    setLoading(true);
    try {
      const summary = {
        totalRows: data.length,
        columns: Object.keys(data[0] || {}).length,
        stats: statsData
      };

      const prompt = `Based on this data summary, provide a brief analysis in JSON format with these exact fields:
{
  "what": "What is this dataset about? (1 sentence)",
  "about": "Key characteristics of the data (2-3 sentences)",
  "why": "Why might this data be important or useful? (1-2 sentences)", 
  "highs": "Notable high values and trends in the data (1-2 sentences)",
  "lows": "Notable low values and trends in the data (1-2 sentences)"
}

Data: ${JSON.stringify(summary)}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (response.ok) {
        const data = await response.json();
        try {
          const parsed = JSON.parse(data.reply);
          const formatted = Object.entries(parsed)
            .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
            .join('\n\n');
          setDescription(formatted);
        } catch {
          setDescription(data.reply);
        }
      }
    } catch (err) {
      setDescription("Analysis generated from data statistics");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="text-red-500" size={40} />
            <h1 className="text-4xl font-bold text-red-500">Smart Analytics</h1>
          </div>
          <p className="text-slate-400 text-lg">Instant insights from CSV data — fast, local, and free.</p>
          <Link href="/projects" className="text-red-400 hover:text-red-300 text-sm mt-2 inline-block">
            ← Back to AI Tools
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Upload CSV File */}
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <FileUp size={18} /> Upload CSV
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-900 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Upload size={18} /> Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            {fileName && (
              <p className="text-sm text-emerald-400">✓ Loaded: {fileName}</p>
            )}
          </div>

          {/* Paste CSV Data */}
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 space-y-4 lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-200">Or Paste CSV Data</h2>
            <p className="text-sm text-slate-400">Include a header row. Only numeric columns are analyzed.</p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-red-500 focus:outline-none font-mono text-sm h-32 resize-none"
              spellCheck={false}
            />
            {error && (
              <div className="flex gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/30">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 disabled:opacity-50 text-slate-900 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Upload size={18} /> {loading ? "Analyzing..." : "Analyze CSV"}
            </button>
          </div>
        </div>

        {/* Description/Insights */}
        {description && (
          <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-4">
              <Brain size={18} /> AI Insights
            </h2>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap">
              {description}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Stats */}
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <Table size={18} /> Summary Stats
            </h2>
            {stats.length === 0 ? (
              <p className="text-slate-500">No numeric columns found yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.map((stat) => (
                  <div key={stat.key} className="bg-slate-900 border border-slate-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-200 font-semibold text-sm">{stat.key}</span>
                      <span className="text-xs text-slate-500">{stat.type === 'numeric' ? '🔢' : '📝'} {stat.count} values</span>
                    </div>
                    {stat.type === 'numeric' ? (
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                        <span>Min: <span className="text-emerald-400">{stat.min?.toFixed(2)}</span></span>
                        <span>Max: <span className="text-orange-400">{stat.max?.toFixed(2)}</span></span>
                        <span>Avg: <span className="text-blue-400">{stat.mean?.toFixed(2)}</span></span>
                      </div>
                    ) : (
                      <div className="space-y-1 text-xs text-slate-400">
                        <div>Unique: <span className="text-purple-400">{stat.uniqueValues}</span></div>
                        <div className="truncate">Most Common: <span className="text-cyan-400">{stat.mostCommon}</span> ({stat.mostCommonCount}x)</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visualization */}
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <BarChart3 size={18} /> Visualization
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    chartType === "bar"
                      ? "bg-red-500 text-slate-900"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType("pie")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    chartType === "pie"
                      ? "bg-red-500 text-slate-900"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setChartType("table")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    chartType === "table"
                      ? "bg-red-500 text-slate-900"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="text-slate-500">Upload data to render a visualization.</p>
            ) : chartType === "bar" ? (
              <BarVisualization rows={rows} stats={stats} />
            ) : chartType === "pie" ? (
              <PieVisualization rows={rows} stats={stats} />
            ) : (
              <TableVisualization rows={rows} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
