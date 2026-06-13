import React, { useState, useRef } from 'react';
import './styles/globals.css';
import { Menu, Moon, Sun, User, BarChart3, Upload, Zap, GitBranch, Download, Settings, Wand2, X, Search, ChevronLeft, ChevronRight, ArrowUpDown, TrendingUp, TrendingDown, Grid3X3, Trash2, AlertCircle } from 'lucide-react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Chart registration
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

// Navbar
function Navbar({ isDarkMode, onThemeToggle, onMenuToggle }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 glass border-b border-dark-700 z-40">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            DataInsight Analytics 
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onThemeToggle}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple p-0.5">
            <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Sidebar
function Sidebar({ currentPage, onPageChange, isOpen, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'visualization', label: 'Visualization', icon: Zap },
    { id: 'cleaning', label: 'Data Cleaning', icon: GitBranch },
    { id: 'insights', label: 'AI Insights', icon: Wand2 },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 glass border-r border-dark-700 z-40 transform transition-transform duration-300 md:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="md:hidden absolute right-4 top-4 p-2 hover:bg-dark-700 rounded-lg"
          >
            <X size={20} />
          </button>

          <nav className="space-y-2 mt-8 md:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-950 font-semibold'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-dark-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t border-dark-700">
            <p className="text-xs text-dark-500 mb-2">DataInsight Analytics Dashboard</p>
            <p className="text-xs text-dark-600">
              AI-powered data analysis platform
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

// Loading Skeleton Component
function SkeletonLoader({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
      ))}
    </div>
  );
}

// Upload Card
function UploadCard({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 30, 90));
      }, 200);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setTimeout(() => {
        onUploadSuccess(data);
        setIsLoading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      alert('Upload failed: ' + error.message);
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div
      onDragOver={(e) => {e.preventDefault(); setIsDragging(true);}}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative glass rounded-xl p-12 border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragging
          ? 'border-neon-cyan bg-dark-800 bg-opacity-60'
          : 'border-dark-600 hover:border-dark-500'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
        disabled={isLoading}
      />

      <div className="text-center">
        <Upload className={`mx-auto mb-4 ${isLoading ? 'animate-pulse' : ''}`} size={48} color="#00d9ff" />
        <h3 className="text-xl font-bold mb-2">Upload Your Dataset</h3>
        <p className="text-dark-400 mb-6">Drag and drop your CSV file or click to browse</p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="btn-primary mb-6"
        >
          {isLoading ? 'Uploading...' : 'Select File'}
        </button>

        <p className="text-sm text-dark-500">Max file size: 50MB • CSV format only</p>

        {isLoading && (
          <div className="mt-6">
            <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-neon-cyan mt-2 text-sm">{progress}% uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Cards
function SummaryCards({ summary }) {
  const cards = [
    { title: 'Total Rows', value: summary?.total_rows || 0, icon: Grid3X3, color: 'cyan' },
    { title: 'Total Columns', value: summary?.total_columns || 0, icon: BarChart3, color: 'purple' },
    { title: 'Missing Values', value: summary?.missing_values || 0, icon: TrendingDown, color: 'pink' },
    { title: 'Duplicate Rows', value: summary?.duplicate_rows || 0, icon: TrendingUp, color: 'cyan' },
  ];

  const colorMap = {
    cyan: 'from-neon-cyan to-blue-500',
    purple: 'from-neon-purple to-pink-500',
    pink: 'from-neon-pink to-red-500',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="card-hover group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-dark-400 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold mt-2 text-dark-100">
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[card.color]} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                <Icon size={24} color={`#${card.color === 'cyan' ? '00d9ff' : card.color === 'purple' ? 'b537f2' : 'ff006e'}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Data Table
function DataTable({ data, columns, loading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  const filteredData = React.useMemo(() => {
    if (!data || !searchTerm) return data || [];
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return <div className="card animate-pulse h-96"></div>;
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-2 bg-dark-800 rounded-lg px-3 py-2">
        <Search size={18} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-transparent flex-1 outline-none text-dark-100"
        />
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              {columns?.slice(0, 8).map((col) => (
                <th key={col}>{col}</th>
              ))}
              {columns && columns.length > 8 && <th>...</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx}>
                {columns?.slice(0, 8).map((col) => (
                  <td key={col} className="truncate max-w-xs">
                    {String(row[col] ?? '-')}
                  </td>
                ))}
                {columns && columns.length > 8 && <td>+{columns.length - 8}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
        <p className="text-sm text-dark-400">
          Showing {paginatedData.length} of {filteredData.length} records
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="flex items-center px-3 py-2 text-dark-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Visualization Panel
function VisualizationPanel({ sessionId, columns, onChartGenerate }) {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateChart = async () => {
    if (!xAxis || !yAxis) {
      alert('Please select both X and Y axes');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/data/${sessionId}/chart-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart_type: chartType,
          x_axis: xAxis,
          y_axis: yAxis,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate chart');

      const data = await response.json();
      onChartGenerate({ type: chartType, data, xAxis, yAxis });
    } catch (error) {
      alert('Failed to generate chart: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const chartTypes = [
    { id: 'bar', label: 'Bar' },
    { id: 'line', label: 'Line' },
    { id: 'pie', label: 'Pie' },
    { id: 'doughnut', label: 'Doughnut' },
    { id: 'scatter', label: 'Scatter' },
    { id: 'area', label: 'Area' },
  ];

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Zap size={24} color="#00d9ff" /> Visualization Studio
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-3 text-dark-200">Chart Type</label>
          <div className="grid grid-cols-2 gap-2">
            {chartTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`p-3 rounded-lg border transition-all ${
                  chartType === type.id
                    ? 'border-neon-cyan bg-neon-cyan bg-opacity-10'
                    : 'border-dark-600'
                }`}
              >
                <p className="text-xs text-center">{type.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-dark-200">X-Axis</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-dark-100"
          >
            <option value="">Select column...</option>
            {columns?.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-dark-200">Y-Axis</label>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-dark-100"
          >
            <option value="">Select column...</option>
            {columns?.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerateChart}
        disabled={isLoading}
        className="btn-primary w-full mt-6"
      >
        {isLoading ? 'Generating...' : 'Generate Chart'}
      </button>
    </div>
  );
}

// Chart Container
function ChartContainer({ chartConfig }) {
  if (!chartConfig) {
    return (
      <div className="card h-96 flex items-center justify-center">
        <p className="text-dark-400">Select data and chart type to visualize</p>
      </div>
    );
  }

  const ChartTypeMap = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
    scatter: Line,      // Use Line for scatter (with point styling)
    area: Line,         // Use Line for area (with fill)
  };

  const ChartComponent = ChartTypeMap[chartConfig.type] || Bar;

  // Process data for scatter charts
  const processedData = chartConfig.type === 'scatter' 
    ? {
        datasets: chartConfig.data.datasets.map(d => ({
          ...d,
          showLine: false,
          borderColor: 'rgb(0, 217, 255)',
          backgroundColor: 'rgba(0, 217, 255, 0.7)',
          pointRadius: 6,
          pointBorderColor: 'rgb(0, 217, 255)',
          pointBorderWidth: 2,
        }))
      }
    : chartConfig.data;

  // Dynamic options based on chart type
  const getChartOptions = (type) => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#ffffff', font: { size: 12, weight: 'bold' } },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          borderColor: '#00d9ff',
          titleColor: '#00d9ff',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 8,
          titleFont: { weight: 'bold' },
          borderWidth: 2,
        },
        filler: {
          propagate: true,
        },
      },
    };

    // Add scales for non-pie/doughnut charts
    if (type !== 'pie' && type !== 'doughnut') {
      baseOptions.scales = {
        y: {
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 11 } },
          grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        },
        x: {
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 11 } },
          grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        },
      };
    }

    // Type-specific options
    if (type === 'line') {
      baseOptions.tension = 0;  // Straight lines, not curved
    }

    if (type === 'area') {
      baseOptions.tension = 0;  // Straight lines
      baseOptions.fill = true;  // Fill under line
    }

    if (type === 'scatter') {
      baseOptions.showLine = false;
      baseOptions.scales = {
        y: {
          type: 'linear',
          position: 'left',
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 11 } },
          grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        },
        x: {
          type: 'linear',
          position: 'bottom',
          ticks: { color: '#e2e8f0', font: { weight: 'bold', size: 11 } },
          grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
        },
      };
    }

    // Doughnut specific: add cutout to make hole in middle
    if (type === 'doughnut') {
      baseOptions.cutout = '60%';  // 60% cutout = doughnut hole
    }

    return baseOptions;
  };

  const defaultOptions = getChartOptions(chartConfig.type);

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `chart-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">{chartConfig.xAxis} vs {chartConfig.yAxis}</h3>
          <p className="text-dark-400 text-sm capitalize">{chartConfig.type} chart</p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Export
        </button>
      </div>

      <div style={{ 
        height: '400px', 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        borderRadius: '12px', 
        padding: '20px',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        boxShadow: '0 0 20px rgba(0, 217, 255, 0.1)'
      }}>
        <ChartComponent
          data={processedData}
          options={defaultOptions}
        />
      </div>
    </div>
  );
}

// AI Insights Panel with Correlation Matrix
function AIInsightsPanel({ sessionId }) {
  const [insights, setInsights] = useState([]);
  const [correlations, setCorrelations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCorrelation, setShowCorrelation] = useState(false);

  const handleGenerateInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/insights/${sessionId}`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      alert('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCorrelations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/insights/${sessionId}/correlation`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setCorrelations(data);
      setShowCorrelation(true);
    } catch (error) {
      alert('Failed to generate correlations');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    info: 'bg-blue-900 bg-opacity-30 border-blue-700 text-blue-200',
    warning: 'bg-yellow-900 bg-opacity-30 border-yellow-700 text-yellow-200',
    error: 'bg-red-900 bg-opacity-30 border-red-700 text-red-200',
  };

  const getCorrelationColor = (value) => {
    const absVal = Math.abs(value);
    if (absVal > 0.8) return '#ff006e';
    if (absVal > 0.6) return '#ffa500';
    if (absVal > 0.4) return '#ffff00';
    if (absVal > 0.2) return '#90ee90';
    return '#d3d3d3';
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Wand2 size={24} color="#b537f2" /> AI Insights
          </h3>
          <button onClick={handleGenerateInsights} disabled={loading} className="btn-primary">
            {loading ? 'Analyzing...' : 'Generate'}
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {insights.length === 0 ? (
            <p className="text-dark-400 text-center py-8">Click "Generate" to analyze your data</p>
          ) : (
            insights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${severityColors[insight.severity || 'info']}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold capitalize text-sm">{insight.type}</p>
                    <p className="text-sm mt-1">{insight.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Grid3X3 size={24} color="#00d9ff" /> Correlation Matrix
          </h3>
          <button onClick={handleGenerateCorrelations} disabled={loading} className="btn-primary">
            {loading ? 'Computing...' : 'Compute'}
          </button>
        </div>
        {showCorrelation && correlations ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-sm mb-3 text-neon-cyan">Strong Correlations (> 0.5)</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {correlations.strong_correlations && correlations.strong_correlations.length > 0 ? (
                  correlations.strong_correlations.map((corr, idx) => (
                    <div key={idx} className="p-3 bg-dark-700 bg-opacity-50 rounded-lg flex items-center justify-between">
                      <span className="text-sm">{corr.col1} ↔ {corr.col2}</span>
                      <span
                        className="px-3 py-1 rounded font-bold text-sm text-white"
                        style={{ backgroundColor: getCorrelationColor(corr.correlation) }}
                      >
                        {corr.correlation.toFixed(3)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-dark-400 text-sm">No strong correlations found</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3 text-neon-purple">Heatmap Preview</h4>
              <div className="overflow-x-auto">
                <table className="text-xs">
                  <tbody>
                    {correlations.columns && correlations.columns.map((col, i) => (
                      <tr key={i}>
                        {correlations.columns.map((_, j) => {
                          const value = correlations.matrix[col][correlations.columns[j]];
                          return (
                            <td
                              key={j}
                              className="p-2 border border-dark-700 text-center font-bold"
                              style={{ backgroundColor: getCorrelationColor(value) + '30' }}
                              title={`${value.toFixed(3)}`}
                            >
                              {value.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-dark-400 text-center py-8">Click "Compute" to generate correlation matrix</p>
        )}
      </div>
    </div>
  );
}

// Data Cleaning Panel
function DataCleaningPanel({ sessionId, onCleaningComplete }) {
  const [activeTab, setActiveTab] = useState('missing');
  const [loading, setLoading] = useState(false);

  const handleMissingValues = async (strategy) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/clean/${sessionId}/missing-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, value: null }),
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      alert(`Removed ${data.rows_before - data.rows_after} rows`);
      onCleaningComplete?.(data);
    } catch (error) {
      alert('Failed to clean data');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/clean/${sessionId}/duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: 'remove' }),
      });

      if (!response.ok) throw new Error('Failed');

      const data = await response.json();
      alert(`Removed ${data.duplicates_removed} duplicate rows`);
      onCleaningComplete?.(data);
    } catch (error) {
      alert('Failed to remove duplicates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <GitBranch size={24} color="#00d9ff" /> Data Cleaning
      </h3>

      <div className="flex gap-2 mb-6 border-b border-dark-700">
        {['missing', 'duplicates'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-neon-cyan text-neon-cyan'
                : 'border-transparent text-dark-400'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'missing' && (
          <>
            <p className="text-dark-300 mb-4">Handle missing values</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button onClick={() => handleMissingValues('drop')} disabled={loading} className="btn-secondary">Drop Rows</button>
              <button onClick={() => handleMissingValues('mean')} disabled={loading} className="btn-secondary">Fill with Mean</button>
              <button onClick={() => handleMissingValues('median')} disabled={loading} className="btn-secondary">Fill with Median</button>
              <button onClick={() => handleMissingValues('mode')} disabled={loading} className="btn-secondary">Fill with Mode</button>
            </div>
          </>
        )}

        {activeTab === 'duplicates' && (
          <>
            <p className="text-dark-300 mb-4">Remove duplicate rows</p>
            <button
              onClick={handleDuplicates}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> Remove Duplicates
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Export Panel
function ExportPanel({ sessionId }) {
  const handleExportCSV = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/export/${sessionId}/csv`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-${sessionId}.csv`;
      a.click();
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Download size={24} color="#00d9ff" /> Export Data
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleExportCSV}
          className="glass rounded-lg p-6 text-center hover:border-neon-cyan transition-all group"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-cyan to-blue-500 bg-opacity-10 mx-auto mb-3 flex items-center justify-center">
            <Download size={24} />
          </div>
          <p className="font-semibold text-dark-100">Export as CSV</p>
        </button>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [currentPage, setCurrentPage] = useState('upload');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [uploadedData, setUploadedData] = useState(null);
  const [dataPreview, setDataPreview] = useState(null);
  const [chartConfig, setChartConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadSuccess = async (data) => {
    setUploadedData(data);
    setDataPreview(data.preview);
    setCurrentPage('dashboard');
  };

  const handleChartGenerate = (config) => {
    setChartConfig(config);
    setCurrentPage('visualization');
  };

  return (
    <div className="bg-dark-950 text-dark-100 min-h-screen">
      <Navbar
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="pt-16 md:ml-64 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'upload' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Upload Dataset</h2>
              <UploadCard onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {currentPage === 'dashboard' && !uploadedData && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="hero-gradient rounded-2xl border border-dark-700 overflow-hidden">
                <div className="px-8 md:px-12 py-16 md:py-20">
                  <div className="max-w-3xl">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                      Welcome to DataInsight platform
                    </h2>
                    <p className="text-lg text-dark-300 mb-8 leading-relaxed">
                      Professional-grade analytics platform for data exploration, visualization, and AI-powered insights. Transform raw data into actionable intelligence.
                    </p>
                    
                    <button
                      onClick={() => setCurrentPage('upload')}
                      className="btn-primary text-lg px-8 py-3 mb-12"
                    >
                      Upload Your Data
                    </button>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="feature-stat">
                        <div className="text-2xl font-bold text-neon-cyan">50+</div>
                        <div className="text-sm text-dark-400">Features</div>
                      </div>
                      <div className="feature-stat">
                        <div className="text-2xl font-bold text-neon-purple">6</div>
                        <div className="text-sm text-dark-400">Chart Types</div>
                      </div>
                      <div className="feature-stat">
                        <div className="text-2xl font-bold text-neon-cyan">10+</div>
                        <div className="text-sm text-dark-400">Analytics</div>
                      </div>
                      <div className="feature-stat">
                        <div className="text-2xl font-bold text-neon-purple">AI</div>
                        <div className="text-sm text-dark-400">Powered</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Key Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="card hover:border-neon-cyan transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neon-cyan bg-opacity-10 rounded-lg">
                        <Upload size={20} className="text-neon-cyan" />
                      </div>
                      <div>
                        <h4 className="font-bold">Smart Upload</h4>
                        <p className="text-sm text-dark-400 mt-1">Drag & drop CSV files with instant preview</p>
                      </div>
                    </div>
                  </div>

                  <div className="card hover:border-neon-purple transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neon-purple bg-opacity-10 rounded-lg">
                        <BarChart3 size={20} className="text-neon-purple" />
                      </div>
                      <div>
                        <h4 className="font-bold">Rich Visualizations</h4>
                        <p className="text-sm text-dark-400 mt-1">6+ chart types with interactive features</p>
                      </div>
                    </div>
                  </div>

                  <div className="card hover:border-neon-cyan transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neon-cyan bg-opacity-10 rounded-lg">
                        <GitBranch size={20} className="text-neon-cyan" />
                      </div>
                      <div>
                        <h4 className="font-bold">Data Cleaning</h4>
                        <p className="text-sm text-dark-400 mt-1">Remove nulls, duplicates & scale data</p>
                      </div>
                    </div>
                  </div>

                  <div className="card hover:border-neon-purple transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neon-purple bg-opacity-10 rounded-lg">
                        <Zap size={20} className="text-neon-purple" />
                      </div>
                      <div>
                        <h4 className="font-bold">AI Insights</h4>
                        <p className="text-sm text-dark-400 mt-1">Trend detection & anomaly alerts</p>
                      </div>
                    </div>
                  </div>

                  <div className="card hover:border-neon-cyan transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neon-cyan bg-opacity-10 rounded-lg">
                        <Download size={20} className="text-neon-cyan" />
                      </div>
                      <div>
                        <h4 className="font-bold">Export Reports</h4>
                        <p className="text-sm text-dark-400 mt-1">Download charts & cleaned datasets</p>
                      </div>
                    </div>
                  </div>

                  <div className="card hover:border-neon-purple transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-neon-purple bg-opacity-10 rounded-lg">
                        <TrendingUp size={20} className="text-neon-purple" />
                      </div>
                      <div>
                        <h4 className="font-bold">Analytics</h4>
                        <p className="text-sm text-dark-400 mt-1">Stats, correlations & summaries</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'dashboard' && uploadedData && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <SummaryCards summary={uploadedData.summary} />
              <div>
                <h3 className="text-xl font-bold mb-4">Data Preview</h3>
                <DataTable
                  data={dataPreview}
                  columns={uploadedData.column_names}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {currentPage === 'visualization' && uploadedData && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Visualization</h2>
              <VisualizationPanel
                sessionId={uploadedData.session_id}
                columns={uploadedData.column_names}
                onChartGenerate={handleChartGenerate}
              />
              <ChartContainer chartConfig={chartConfig} />
            </div>
          )}

          {currentPage === 'cleaning' && uploadedData && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Data Cleaning</h2>
              <DataCleaningPanel
                sessionId={uploadedData.session_id}
                onCleaningComplete={(data) => alert('Data cleaned!')}
              />
            </div>
          )}

          {currentPage === 'insights' && uploadedData && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">AI Insights</h2>
              <AIInsightsPanel sessionId={uploadedData.session_id} />
            </div>
          )}

          {currentPage === 'export' && uploadedData && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Export</h2>
              <ExportPanel sessionId={uploadedData.session_id} />
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Settings</h2>
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="btn-secondary"
                  >
                    {isDarkMode ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!uploadedData && currentPage !== 'upload' && (
            <div className="text-center py-12">
              <p className="text-dark-400 mb-4">Please upload a dataset first</p>
              <button
                onClick={() => setCurrentPage('upload')}
                className="btn-primary"
              >
                Go to Upload
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
