import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie,
  AreaChart,
  Area
} from 'recharts';
import { 
  LayoutDashboard, BarChart3, Link2, TrendingUp, MessageSquare, 
  Upload, Database, AlertCircle, ChevronRight, Search, Trash2,
  FileText, Info, Settings, Sparkles,
  Download, Filter, RefreshCw, Camera, RotateCcw, X
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

import { cn } from './lib/utils';
import { analyzeData, getCorrelation, cleanData, CleaningAction, professionalAutoClean } from './analyst';
import { DataRow, DataStats } from './types';

const PALETTE = ["#FF4B4B", "#1C83E1", "#09AB3B", "#FFD166", "#7D33FF", "#FF8C00", "#00C49F", "#FFBB28"];

const downloadChart = async (element: HTMLElement | null, name: string) => {
  if (!element) return;
  try {
    // Wait for any animations to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Get the SVG from the clone
    const svg = clone.querySelector('svg');
    if (!svg) {
      console.error('No SVG found in chart');
      return;
    }
    
    // Ensure SVG has proper dimensions
    const rect = element.getBoundingClientRect();
    svg.setAttribute('width', String(rect.width));
    svg.setAttribute('height', String(rect.height));
    
    // Serialize SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create image and canvas
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size (2x for retina)
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  } catch (err) {
    console.error('Failed to download chart', err);
  }
};

function ChartDownloadButton({ targetRef, chartName }: { targetRef: React.RefObject<HTMLDivElement>, chartName: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!targetRef.current) return;
    setIsDownloading(true);
    await downloadChart(targetRef.current, chartName);
    setIsDownloading(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className="p-2 hover:bg-slate-100 rounded-lg transition-all group relative"
      title="Download as PNG"
    >
      <Camera size={18} className={cn("text-slate-400 group-hover:text-slate-600", isDownloading && "opacity-50")} />
      {isDownloading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw size={14} className="animate-spin text-slate-600" />
        </div>
      )}
    </button>
  );
}

export default function App() {
  const [data, setData] = useState<DataRow[]>([]);
  const [originalData, setOriginalData] = useState<DataRow[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', text: string, chartConfig?: any }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [globalFilters, setGlobalFilters] = useState<Record<string, any>>({});
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isAutoCleaned, setIsAutoCleaned] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const cleanedData = useMemo(() => {
    return isAutoCleaned ? professionalAutoClean(data) : data;
  }, [data, isAutoCleaned]);

  const filteredData = useMemo(() => {
    return cleanedData.filter(row => {
      return Object.entries(globalFilters).every(([col, val]) => {
        if (!val || val === 'All') return true;
        return String(row[col]) === String(val);
      });
    });
  }, [cleanedData, globalFilters]);

  const filteredStats = useMemo(() => {
    if (filteredData.length === 0) return null;
    return analyzeData(filteredData);
  }, [filteredData]);

  useEffect(() => {
    // Demo data no longer loaded automatically
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show progress for files larger than 1MB
    const showProgress = file.size > 1024 * 1024;
    if (showProgress) {
      setIsUploading(true);
      setUploadProgress(0);
      // Simulate progress for large files
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null || prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    }

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const rows = (results.data as DataRow[]).filter(r => Object.keys(r).length > 0);
          setData(rows);
          setOriginalData(rows);
          setIsUploaded(true);
          setActiveTab('overview');
          setGlobalFilters({});
          setIsAutoCleaned(false);
          if (showProgress) {
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setUploadProgress(null);
            }, 500);
          }
        },
        error: () => {
          if (showProgress) {
            setIsUploading(false);
            setUploadProgress(null);
          }
        }
      });
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws) as DataRow[];
        setData(rows);
        setOriginalData(rows);
        setIsUploaded(true);
        setActiveTab('overview');
        setGlobalFilters({});
        setIsAutoCleaned(false);
        if (showProgress) {
          setUploadProgress(100);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(null);
          }, 500);
        }
      };
      reader.onerror = () => {
        if (showProgress) {
          setIsUploading(false);
          setUploadProgress(null);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleClean = (action: CleaningAction) => {
    const cleaned = cleanData(data, action);
    setData(cleaned);
  };

  const handleResetData = () => {
    setData(originalData);
  };

  const handleAiAsk = async (q?: string) => {
    const question = q || userInput;
    if (!question || !filteredStats) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text: question }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsAiLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const context = `
        Dataset Summary:
        - Rows: ${filteredStats.shape[0]}
        - Columns: ${filteredStats.shape[1]}
        - Numeric: ${filteredStats.numCols.join(', ')}
        - Categorical: ${filteredStats.catCols.join(', ')}
        - Insights: ${filteredStats.insights.join('; ')}
      `;

      const prompt = `
        You are a world-class data analyst. Use ONLY the provided context to answer.
        Focus on describing patterns, trends, and data quality issues.
        
        IMPORTANT: Do NOT provide business advice, strategic recommendations, or answer "what should I do" type questions. 
        Your role is strictly to analyze and describe the data as it is.
        
        If the user asks for a chart or visualization, provide a "chartConfig" object in your JSON response.
        
        The "chartConfig" should follow this structure:
        {
          "type": "bar" | "line" | "pie" | "scatter",
          "data": Array<{ name: string, value: number }>,
          "title": string
        }

        Response Format:
        {
          "text": "Your analysis text here (markdown supported)",
          "chartConfig": null | { ... }
        }

        Context: ${context}
        Question: ${question}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { 
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      setChatMessages([...newMessages, { 
        role: 'assistant', 
        text: result.text || 'No response',
        chartConfig: result.chartConfig 
      }]);
    } catch (error) {
      console.error('AI Error:', error);
      setChatMessages([...newMessages, { role: 'assistant', text: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-100 border-r border-slate-200 transition-all duration-300 flex flex-col",
        isSidebarCollapsed ? "w-20" : "w-64",
        isPresentationMode && "hidden"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-200">
          <div className="w-8 h-8 bg-[#FF4B4B] rounded-lg flex items-center justify-center text-white shrink-0">
            <BarChart3 size={20} />
          </div>
          {!isSidebarCollapsed && <h1 className="font-bold text-xl tracking-tight">BizAnalyst<span className="text-[#FF4B4B]">AI</span></h1>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<BarChart3 size={20} />} label="Distributions" active={activeTab === 'distributions'} onClick={() => setActiveTab('distributions')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<Link2 size={20} />} label="Correlations" active={activeTab === 'correlations'} onClick={() => setActiveTab('correlations')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<TrendingUp size={20} />} label="Trends" active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} collapsed={isSidebarCollapsed} />
          <SidebarItem icon={<MessageSquare size={20} />} label="AI Analyst" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} collapsed={isSidebarCollapsed} />
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-white rounded-lg transition-all"
          >
            <ChevronRight size={20} className={cn("transition-transform", !isSidebarCollapsed && "rotate-180")} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={cn("h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0", isPresentationMode && "hidden")}>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Database size={20} className="text-slate-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Active Dataset</h2>
              <p className="text-xs text-slate-500">{filteredData.length > 0 ? `${filteredData.length} records loaded` : 'No data loaded'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {filteredData.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                {data.length !== originalData.length && (
                  <button 
                    onClick={handleResetData}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-white text-slate-600 border-slate-200 hover:border-red-500 hover:text-red-500"
                  >
                    <RotateCcw size={14} />
                    Reset Data
                  </button>
                )}
                <button 
                  onClick={() => setIsPresentationMode(!isPresentationMode)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                    isPresentationMode ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-600"
                  )}
                >
                  <Camera size={14} />
                  Presentation Mode
                </button>
              </div>
            )}

            {!isUploaded && (
              <label className="flex items-center gap-2 px-4 py-2 bg-[#FF4B4B] text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-[#FF3333] transition-all shadow-lg shadow-red-100">
                <Upload size={18} />
                Upload CSV/XLSX
                <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
              </label>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {isUploading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-indigo-600 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Uploading File</h3>
                    <p className="text-sm text-slate-500">Please wait while we process your data...</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress || 0}%` }}
                  />
                </div>
                <p className="text-right text-xs font-bold text-indigo-600 mt-2">{uploadProgress || 0}%</p>
              </div>
            </div>
          )}

          {isPresentationMode && (
            <button 
              onClick={() => setIsPresentationMode(false)}
              className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full shadow-lg text-slate-600 hover:text-red-500 transition-all"
              title="Exit Presentation Mode"
            >
              <X size={20} />
            </button>
          )}
          {filteredData.length > 0 && !isPresentationMode && (
            <GlobalFilters 
              stats={filteredStats!} 
              data={cleanedData} 
              filters={globalFilters} 
              setFilters={setGlobalFilters} 
              isAutoCleaned={isAutoCleaned}
              setIsAutoCleaned={setIsAutoCleaned}
            />
          )}

          {data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-100 flex items-center justify-center text-slate-200 border border-slate-50">
                <Database size={48} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">Open Source Data Analyst</h3>
                <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                  A professional-grade tool for automated data cleaning, visualization, and AI-powered insights.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 px-8 py-4 bg-[#FF4B4B] text-white rounded-2xl font-bold text-base cursor-pointer hover:bg-[#FF3333] transition-all shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-[0.98]">
                  <Upload size={20} />
                  Upload Dataset
                  <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
                </label>
              </div>

              <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">1</div>
                    Clean Your Data
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Remove empty rows and ensure consistent formatting to prevent AI hallucinations and errors.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">2</div>
                    Check Column Names
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Use clear, descriptive headers (e.g., "Revenue" instead of "Col_1") for better AI context.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">3</div>
                    Handle Outliers
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    BizAnalyst can auto-detect outliers, but manual review ensures your specific business context is kept.
                  </p>
                </div>
              </div>
            </div>
          ) : !filteredStats ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                <Filter size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No data matches your filters</h3>
              <p className="text-slate-500 text-sm">Try adjusting your global filters or resetting them.</p>
              <button 
                onClick={() => {
                  setGlobalFilters({});
                  setIsAutoCleaned(false);
                }}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {activeTab === 'overview' && <OverviewTab data={filteredData} stats={filteredStats} onClean={handleClean} />}
                {activeTab === 'distributions' && <DistributionsTab data={filteredData} stats={filteredStats} />}
                {activeTab === 'correlations' && <CorrelationsTab data={filteredData} stats={filteredStats} />}
                {activeTab === 'trends' && <TrendsTab data={filteredData} stats={filteredStats} />}
                {activeTab === 'ai' && <AiTab chatMessages={chatMessages} userInput={userInput} setUserInput={setUserInput} handleAiAsk={handleAiAsk} isLoading={isAiLoading} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}

function GlobalFilters({ stats, data, filters, setFilters, isAutoCleaned, setIsAutoCleaned }: { 
  stats: DataStats, 
  data: DataRow[], 
  filters: Record<string, any>, 
  setFilters: (f: Record<string, any>) => void,
  isAutoCleaned: boolean,
  setIsAutoCleaned: (v: boolean) => void
}) {
  const filterableCols = stats.catCols.filter(col => stats.cardinality[col] < 15);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-slate-500 mr-2">
        <Filter size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Global Filters</span>
      </div>
      {filterableCols.map(col => {
        const options = Array.from(new Set(data.map(r => String(r[col])))).sort();
        return (
          <div key={col} className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{col}</label>
            <select 
              value={filters[col] || 'All'} 
              onChange={e => setFilters({ ...filters, [col]: e.target.value })}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 min-w-[120px] focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All {col}s</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        );
      })}

      <div className="ml-auto flex items-center gap-4 pl-4 border-l border-slate-100">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expert Mode</label>
          <button
            onClick={() => setIsAutoCleaned(!isAutoCleaned)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
              isAutoCleaned 
                ? "bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm" 
                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-500 hover:text-indigo-600"
            )}
            title="Applies professional data cleaning: removes duplicates, standardizes text, handles missing values, and clips outliers."
          >
            <Settings size={12} />
            {isAutoCleaned ? "Auto-Cleaned" : "Professional Auto-Clean"}
          </button>
        </div>
      </div>

      <button 
        onClick={() => {
          setFilters({});
          setIsAutoCleaned(false);
        }}
        className="text-xs text-slate-400 hover:text-[#FF4B4B] font-bold uppercase tracking-widest flex items-center gap-1 ml-2"
      >
        <RefreshCw size={12} />
        Reset All
      </button>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-all group",
        active ? "bg-white text-[#FF4B4B] shadow-sm" : "text-slate-600 hover:bg-white/50 hover:text-slate-900",
        collapsed && "justify-center"
      )}
    >
      <div className={cn("transition-transform group-hover:scale-110", active && "text-[#FF4B4B]")}>
        {icon}
      </div>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function OverviewTab({ data, stats, onClean }: { data: DataRow[], stats: DataStats, onClean: (action: CleaningAction) => void }) {
  const [typeFilter, setTypeFilter] = useState('All');
  const [missingFilter, setMissingFilter] = useState('All');
  const [previewSeed, setPreviewSeed] = useState(0);

  const previewData = useMemo(() => {
    if (previewSeed === 0) return data.slice(0, 8);
    // Simple shuffle for preview
    return [...data].sort(() => Math.random() - 0.5).slice(0, 8);
  }, [data, previewSeed]);

  const filteredColumns = useMemo(() => {
    return Object.keys(data[0]).filter(col => {
      const isNum = stats.numCols.includes(col);
      const isCat = stats.catCols.includes(col);
      const isDate = stats.dateCols.includes(col);
      
      let typeMatch = true;
      if (typeFilter === 'Numeric') typeMatch = isNum;
      else if (typeFilter === 'Categorical') typeMatch = isCat;
      else if (typeFilter === 'Date') typeMatch = isDate;

      const missingCount = isNum ? stats.summary[col].missing : (data.length - data.filter(r => r[col] !== null && r[col] !== undefined && r[col] !== '').length);
      let missingMatch = true;
      if (missingFilter === 'With Missing') missingMatch = missingCount > 0;
      else if (missingFilter === 'No Missing') missingMatch = missingCount === 0;

      return typeMatch && missingMatch;
    });
  }, [data, stats, typeFilter, missingFilter]);

  const resolvableInsights = useMemo(() => {
    return stats.insights.map(insight => {
      const colMatch = insight.match(/<b>(.*?)<\/b>/);
      const column = colMatch ? colMatch[1] : null;
      
      if (!column) return { text: insight, action: null };

      if (insight.includes('missing values')) {
        return { 
          text: insight, 
          column,
          actions: [
            { label: 'Drop Rows', type: 'drop_missing' as const },
            { label: 'Impute (Mean)', type: 'impute_missing' as const, method: 'mean' as const },
            { label: 'Impute (Mode)', type: 'impute_missing' as const, method: 'mode' as const }
          ]
        };
      }
      if (insight.includes('Outlier-heavy')) {
        return { 
          text: insight, 
          column,
          actions: [
            { label: 'Remove Rows', type: 'remove_outliers' as const },
            { label: 'Clip Values', type: 'clip_outliers' as const }
          ]
        };
      }
      if (insight.includes('High-cardinality')) {
        return { 
          text: insight, 
          column,
          actions: [
            { label: 'Group Others (Top 10)', type: 'group_cardinality' as const, topN: 10 }
          ]
        };
      }
      return { text: insight, action: null };
    });
  }, [stats.insights]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Rows" value={stats.shape[0].toLocaleString()} sub="Records in dataset" icon={<Database className="text-blue-500" />} />
        <StatCard label="Columns" value={stats.shape[1].toString()} sub={`${stats.numCols.length} Numeric, ${stats.catCols.length} Categorical`} icon={<FileText className="text-indigo-500" />} />
        <StatCard label="Date Range" value={stats.dateCols.length > 0 ? "Available" : "N/A"} sub={stats.dateCols.length > 0 ? `${stats.dateCols.length} date columns` : "No time series data"} icon={<TrendingUp className="text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={20} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800">Auto Insights & Resolutions</h3>
          </div>
          <div className="space-y-4">
            {resolvableInsights.map((insight, i) => (
              <div key={i} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-sm text-slate-700 leading-relaxed flex flex-col gap-3">
                <div className="flex gap-3">
                  <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div dangerouslySetInnerHTML={{ __html: insight.text }} />
                </div>
                {insight.actions && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-indigo-100">
                    {insight.actions.map((action, j) => (
                      <button
                        key={j}
                        onClick={() => onClean({ ...action, column: insight.column! } as CleaningAction)}
                        className="px-2 py-1 bg-white border border-indigo-200 rounded text-[10px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database size={20} className="text-slate-400" />
              <h3 className="font-bold text-slate-800">Data Preview</h3>
            </div>
            <button 
              onClick={() => setPreviewSeed(s => s + 1)}
              className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              <RefreshCw size={12} />
              Shuffle Sample
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {Object.keys(data[0]).slice(0, 6).map(col => (
                    <th key={col} className="pb-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {previewData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    {Object.values(row).slice(0, 6).map((val, j) => (
                      <td key={j} className="py-3 text-slate-600 truncate max-w-[120px]">
                        {typeof val === 'number' ? val.toLocaleString() : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-bold text-slate-800">Column Statistics</h3>
          <div className="flex flex-wrap items-center gap-3">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
              <option value="All">All Types</option>
              <option value="Numeric">Numeric</option>
              <option value="Categorical">Categorical</option>
              <option value="Date">Date</option>
            </select>
            <select value={missingFilter} onChange={(e) => setMissingFilter(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
              <option value="All">All Missing</option>
              <option value="With Missing">With Missing</option>
              <option value="No Missing">No Missing</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-500">Column Name</th>
                <th className="pb-4 font-semibold text-slate-500">Type</th>
                <th className="pb-4 font-semibold text-slate-500">Mean</th>
                <th className="pb-4 font-semibold text-slate-500">Min</th>
                <th className="pb-4 font-semibold text-slate-500">Max</th>
                <th className="pb-4 font-semibold text-slate-500">Unique</th>
                <th className="pb-4 font-semibold text-slate-500">Missing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredColumns.map(col => {
                const isNum = stats.numCols.includes(col);
                const isDate = stats.dateCols.includes(col);
                const s = stats.summary[col];
                const missingCount = isNum ? s.missing : (data.length - data.filter(r => r[col] !== null && r[col] !== undefined && r[col] !== '').length);
                return (
                  <tr key={col} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-800">{col}</td>
                    <td className="py-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", isNum ? "bg-blue-50 text-blue-600" : isDate ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600")}>
                        {isNum ? 'Numeric' : isDate ? 'Date' : 'Categorical'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500">{isNum ? s.mean.toFixed(2) : '—'}</td>
                    <td className="py-4 text-slate-500">{isNum ? s.min.toFixed(2) : '—'}</td>
                    <td className="py-4 text-slate-500">{isNum ? s.max.toFixed(2) : '—'}</td>
                    <td className="py-4 text-slate-500">{stats.cardinality[col]}</td>
                    <td className={cn("py-4 text-slate-500", missingCount > 0 && "bg-amber-50/50")}>
                      <span className={cn(missingCount > 0 && "text-amber-700", (missingCount / data.length) > 0.1 ? "font-bold" : "font-medium")}>
                        {missingCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DistributionsTab({ data, stats }: { data: DataRow[], stats: DataStats }) {
  const [selectedNum, setSelectedNum] = useState(stats.numCols[0]);
  const [selectedCat, setSelectedCat] = useState(stats.catCols[0]);
  const [chartType, setChartType] = useState<'histogram' | 'boxplot'>('histogram');
  const numChartRef = useRef<HTMLDivElement>(null);
  const catChartRef = useRef<HTMLDivElement>(null);

  const histData = useMemo(() => {
    if (!selectedNum) return [];
    const values = data.map(r => Number(r[selectedNum])).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 20;
    const binSize = (max - min) / binCount;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      name: (min + i * binSize).toFixed(1),
      range: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0,
    }));
    values.forEach(v => {
      const binIdx = Math.min(binCount - 1, Math.floor((v - min) / binSize));
      bins[binIdx].count++;
    });
    return bins;
  }, [data, selectedNum]);

  const boxPlotData = useMemo(() => {
    if (!selectedNum) return [];
    const s = stats.summary[selectedNum];
    return [{
      name: selectedNum,
      min: s.min,
      q1: s.q1,
      median: s.median,
      q3: s.q3,
      max: s.max,
      low: s.q1 - s.min,
      mid: s.median - s.q1,
      high: s.q3 - s.median,
      top: s.max - s.q3
    }];
  }, [stats, selectedNum]);

  const catData = useMemo(() => {
    if (!selectedCat) return [];
    const counts: Record<string, number> = {};
    data.forEach(r => {
      const v = String(r[selectedCat]);
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data, selectedCat]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Numeric Distribution</h3>
            <div className="flex items-center gap-2">
              <ChartDownloadButton targetRef={numChartRef} chartName={`numeric-distribution-${selectedNum}`} />
              <select value={chartType} onChange={e => setChartType(e.target.value as any)} className="text-xs p-1 bg-slate-50 border border-slate-200 rounded">
                <option value="histogram">Histogram</option>
                <option value="boxplot">Box Plot</option>
              </select>
              <select value={selectedNum} onChange={e => setSelectedNum(e.target.value)} className="text-xs p-1 bg-slate-50 border border-slate-200 rounded">
                {stats.numCols.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="h-[400px] min-h-[400px]" ref={numChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'histogram' ? (
                <BarChart data={histData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    label={{ value: selectedNum, position: 'insideBottom', offset: -20, fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={PALETTE[1]} />
                </BarChart>
              ) : (
                <BarChart data={boxPlotData} layout="vertical" margin={{ top: 20, right: 40, bottom: 20, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="low" stackId="a" fill="transparent" />
                  <Bar dataKey="mid" stackId="a" fill={PALETTE[1]} />
                  <Bar dataKey="high" stackId="a" fill={PALETTE[1]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Distribution Data</h4>
            <div className="max-h-[150px] overflow-y-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-[10px]">
                <thead className="sticky top-0 bg-white border-b border-slate-100">
                  <tr>
                    <th className="p-2 font-bold text-slate-400 uppercase">Range / Value</th>
                    <th className="p-2 font-bold text-slate-400 uppercase">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {chartType === 'histogram' ? histData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-600">{row.range}</td>
                      <td className="p-2 text-slate-600 font-bold">{row.count}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td className="p-2 text-slate-600">Stats (Min, Q1, Median, Q3, Max)</td>
                      <td className="p-2 text-slate-600 font-bold">
                        {boxPlotData[0].min.toFixed(2)}, {boxPlotData[0].q1.toFixed(2)}, {boxPlotData[0].median.toFixed(2)}, {boxPlotData[0].q3.toFixed(2)}, {boxPlotData[0].max.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Categorical Distribution</h3>
            <div className="flex items-center gap-2">
              <ChartDownloadButton targetRef={catChartRef} chartName={`categorical-distribution-${selectedCat}`} />
              <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="text-xs p-1 bg-slate-50 border border-slate-200 rounded">
                {stats.catCols.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="h-[400px] min-h-[400px]" ref={catChartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical" margin={{ top: 20, right: 40, bottom: 20, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={70} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill={PALETTE[2]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Top Categories</h4>
            <div className="max-h-[150px] overflow-y-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-[10px]">
                <thead className="sticky top-0 bg-white border-b border-slate-100">
                  <tr>
                    <th className="p-2 font-bold text-slate-400 uppercase">Category</th>
                    <th className="p-2 font-bold text-slate-400 uppercase">Count</th>
                    <th className="p-2 font-bold text-slate-400 uppercase">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {catData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-600 font-medium">{row.name}</td>
                      <td className="p-2 text-slate-600 font-bold">{row.count}</td>
                      <td className="p-2 text-slate-400">{((row.count / data.length) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CorrelationsTab({ data, stats }: { data: DataRow[], stats: DataStats }) {
  const [colX, setColX] = useState(stats.numCols[0]);
  const [colY, setColY] = useState(stats.numCols[1] || stats.numCols[0]);
  const [viewMode, setViewMode] = useState<'scatter' | 'heatmap'>('scatter');
  const [showTrendline, setShowTrendline] = useState(false);
  const scatterChartRef = useRef<HTMLDivElement>(null);

  const scatterData = useMemo(() => {
    return data.slice(0, 500)
      .map(r => ({ x: Number(r[colX]), y: Number(r[colY]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));
  }, [data, colX, colY]);

  const trendlineData = useMemo(() => {
    if (!showTrendline || scatterData.length < 2) return [];
    
    const n = scatterData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    scatterData.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumXY += p.x * p.y;
      sumX2 += p.x * p.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const minX = Math.min(...scatterData.map(p => p.x));
    const maxX = Math.max(...scatterData.map(p => p.x));

    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
  }, [scatterData, showTrendline]);

  const correlationMatrix = useMemo(() => {
    const cols = stats.numCols.slice(0, 8);
    return cols.map(c1 => ({
      name: c1,
      ...Object.fromEntries(cols.map(c2 => [c2, getCorrelation(data, c1, c2)]))
    }));
  }, [data, stats.numCols]);

  return (
    <div className="space-y-8">
      <div className="flex justify-center mb-4">
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button onClick={() => setViewMode('scatter')} className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", viewMode === 'scatter' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}>Scatter Plot</button>
          <button onClick={() => setViewMode('heatmap')} className={cn("px-6 py-2 rounded-lg text-sm font-bold transition-all", viewMode === 'heatmap' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}>Correlation Heatmap</button>
        </div>
      </div>

      {viewMode === 'scatter' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800">Scatter Explorer</h3>
            <div className="space-y-4">
              <select value={colX} onChange={e => setColX(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                {stats.numCols.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={colY} onChange={e => setColY(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                {stats.numCols.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase mb-1">Correlation</div>
              <div className="text-2xl font-bold text-[#FF4B4B]">{getCorrelation(data, colX, colY).toFixed(3)}</div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={showTrendline} onChange={e => setShowTrendline(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Show Trendline</span>
            </label>
          </div>
          <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Scatter Plot: {colX} vs {colY}</h4>
              <ChartDownloadButton targetRef={scatterChartRef} chartName={`scatter-${colX}-vs-${colY}`} />
            </div>
            <div className="h-[500px] min-h-[500px]" ref={scatterChartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name={colX} 
                    unit="" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    label={{ value: colX, position: 'insideBottom', offset: -20, fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name={colY} 
                    unit="" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    label={{ value: colY, angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Scatter name="Data" data={scatterData} fill={PALETTE[1]} fillOpacity={0.6} />
                  {showTrendline && (
                    <Line data={trendlineData} type="monotone" dataKey="y" stroke="#FF4B4B" strokeWidth={2} dot={false} activeDot={false} />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sample Data Points ({scatterData.length})</h4>
              </div>
              <div className="max-h-[200px] overflow-y-auto rounded-lg border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-white border-b border-slate-100">
                    <tr>
                      <th className="p-2 font-bold text-slate-400 uppercase">{colX}</th>
                      <th className="p-2 font-bold text-slate-400 uppercase">{colY}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {scatterData.slice(0, 100).map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 text-slate-600">{p.x.toLocaleString()}</td>
                        <td className="p-2 text-slate-600">{p.y.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {scatterData.length > 100 && (
                <p className="text-[10px] text-slate-400 mt-2 text-center italic">Showing first 100 of {scatterData.length} plotted points</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Correlation Heatmap</h3>
              <p className="text-sm text-slate-500">Relationship strength between numeric variables</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="text-[#FF4B4B]">Negative (-1)</span>
              <div className="w-24 h-2 bg-gradient-to-r from-[#FF4B4B] via-slate-100 to-[#1C83E1] rounded-full" />
              <span className="text-[#1C83E1]">Positive (+1)</span>
            </div>
          </div>
          <div className="min-w-[600px]">
            <div className="flex mb-4">
              <div className="w-32 shrink-0" />
              {stats.numCols.slice(0, 8).map(col => (
                <div key={col} className="flex-1 text-center text-[10px] font-bold text-slate-400 uppercase truncate px-2">{col}</div>
              ))}
            </div>
            {correlationMatrix.map(row => (
              <div key={row.name} className="flex items-center">
                <div className="w-32 shrink-0 text-right pr-4 text-[10px] font-bold text-slate-400 uppercase truncate">{row.name}</div>
                {stats.numCols.slice(0, 8).map(col => {
                  const val = row[col] as number;
                  const opacity = Math.abs(val);
                  const color = val > 0 ? `rgba(28, 131, 225, ${opacity})` : `rgba(255, 75, 75, ${opacity})`;
                  return (
                    <div 
                      key={col} 
                      className="flex-1 aspect-square flex items-center justify-center text-[10px] font-bold border border-white transition-transform hover:scale-110 hover:z-10 cursor-help" 
                      style={{ backgroundColor: color, color: opacity > 0.5 ? 'white' : 'black' }}
                      title={`${row.name} vs ${col}: ${val.toFixed(3)}`}
                    >
                      {val.toFixed(2)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrendsTab({ data, stats }: { data: DataRow[], stats: DataStats }) {
  const [selectedMetric, setSelectedMetric] = useState(stats.numCols[0]);
  const [dateCol, setDateCol] = useState(stats.dateCols[0] || '');
  const trendChartRef = useRef<HTMLDivElement>(null);

  const trendData = useMemo(() => {
    if (!dateCol || !selectedMetric) return [];
    const groups: Record<string, { sum: number, count: number }> = {};
    data.forEach(r => {
      const d = String(r[dateCol]);
      const v = Number(r[selectedMetric]);
      if (!isNaN(v)) {
        if (!groups[d]) groups[d] = { sum: 0, count: 0 };
        groups[d].sum += v;
        groups[d].count++;
      }
    });
    
    const actuals = Object.entries(groups)
      .map(([date, val]) => ({ date, actual: val.sum / val.count, forecast: undefined as number | undefined }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const forecasts = stats.forecasts[selectedMetric] || [];
    const forecastPoints = forecasts.map(f => ({
      date: f.date,
      forecast: f.value as number | undefined,
      actual: undefined as number | undefined
    }));

    // Connect the last actual point to the first forecast point
    if (actuals.length > 0 && forecastPoints.length > 0) {
      forecastPoints[0].actual = actuals[actuals.length - 1].actual;
    }

    return [...actuals, ...forecastPoints];
  }, [data, dateCol, selectedMetric, stats.forecasts]);

  if (!stats.dateCols.length) return <div className="p-12 text-center text-slate-400 italic">No date columns found for trend analysis.</div>;

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Time Series Analysis</h3>
          <p className="text-xs text-slate-500">Includes 30-day predictive forecasting</p>
        </div>
        <div className="flex items-center gap-4">
          <ChartDownloadButton targetRef={trendChartRef} chartName={`trend-${selectedMetric}-over-time`} />
          <select value={dateCol} onChange={e => setDateCol(e.target.value)} className="text-xs p-1 bg-slate-50 border border-slate-200 rounded">
            {stats.dateCols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)} className="text-xs p-1 bg-slate-50 border border-slate-200 rounded">
            {stats.numCols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="h-[400px] min-h-[400px]" ref={trendChartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ value: dateCol, position: 'insideBottom', offset: -20, fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              label={{ value: selectedMetric, angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number, name: string) => [
                value.toFixed(2), 
                name === 'forecast' ? 'Forecasted Value' : 'Actual Value'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke={PALETTE[1]} 
              fill={PALETTE[1]} 
              fillOpacity={0.1} 
              strokeWidth={2}
              connectNulls
              name="Actual"
            />
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="#FF4B4B" 
              fill="#FF4B4B" 
              fillOpacity={0.1} 
              strokeWidth={2}
              strokeDasharray="5 5"
              connectNulls
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Trend Data Table</h4>
        <div className="max-h-[250px] overflow-y-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white border-b border-slate-100">
              <tr>
                <th className="p-3 font-bold text-slate-400 uppercase">{dateCol}</th>
                <th className="p-3 font-bold text-slate-400 uppercase">Actual {selectedMetric}</th>
                <th className="p-3 font-bold text-slate-400 uppercase">Forecasted {selectedMetric}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trendData.slice().reverse().map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-600 font-medium">{row.date}</td>
                  <td className="p-3 text-slate-600">{row.actual !== undefined ? row.actual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</td>
                  <td className="p-3 text-[#FF4B4B] font-medium">{row.forecast !== undefined ? row.forecast.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AiTab({ chatMessages, userInput, setUserInput, handleAiAsk, isLoading }: { 
  chatMessages: { role: 'user' | 'assistant', text: string, chartConfig?: any }[], 
  userInput: string, 
  setUserInput: (v: string) => void, 
  handleAiAsk: (q?: string) => void,
  isLoading: boolean
}) {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Sparkles size={18} /></div>
          <h3 className="font-bold text-slate-800">AI Data Analyst</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {chatMessages.map((msg, i) => (
          <div key={i} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-indigo-600 text-white")}>
              {msg.role === 'user' ? <Database size={16} /> : <Sparkles size={16} />}
            </div>
            <div className={cn("p-4 rounded-2xl text-sm leading-relaxed space-y-4", msg.role === 'user' ? "bg-white border border-slate-200 text-slate-700" : "bg-indigo-600 text-white")}>
              {msg.role === 'assistant' ? (
                <>
                  <div className="markdown-body">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                  {msg.chartConfig && (
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 h-[250px] w-full mt-4">
                      <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-80">{msg.chartConfig.title}</p>
                      <ResponsiveContainer width="100%" height="100%">
                        {msg.chartConfig.type === 'bar' ? (
                          <BarChart data={msg.chartConfig.data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.7)' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.7)' }} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', color: '#1e293b' }}
                              itemStyle={{ fontSize: '10px' }}
                            />
                            <Bar dataKey="value" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : msg.chartConfig.type === 'line' ? (
                          <LineChart data={msg.chartConfig.data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.7)' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.7)' }} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', color: '#1e293b' }}
                              itemStyle={{ fontSize: '10px' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={2} dot={false} />
                          </LineChart>
                        ) : (
                          <PieChart>
                            <Pie data={msg.chartConfig.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#FFFFFF">
                              {msg.chartConfig.data.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 border-t border-slate-100 bg-white">
        <form onSubmit={(e) => { e.preventDefault(); handleAiAsk(); }} className="relative">
          <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Ask a question about your data..." className="w-full pl-4 pr-12 py-4 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500" />
          <button type="submit" disabled={isLoading || !userInput} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center"><ChevronRight size={20} /></button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-3 italic">
          AI insights are generated based on your data. Ensure data is cleaned to avoid hallucinations.
        </p>
      </div>
    </div>
  );
}
