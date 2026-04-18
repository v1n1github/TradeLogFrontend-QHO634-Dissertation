import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Filler, Title
);

// ── Shared chart defaults ────────────────────────────────────────────────────
const tooltipDefaults = {
  backgroundColor: '#13131f',
  borderColor: '#1e1e30',
  borderWidth: 1,
  titleColor: '#94a3b8',
  bodyColor: '#e2e8f0',
  padding: 10,
  cornerRadius: 8,
};

// ── Win / Loss Pie ────────────────────────────────────────────────────────────
export function WinLossChart({ data }) {
  if (!data) return null;
  const chartData = {
    labels: ['Wins', 'Losses', 'Breakeven'],
    datasets: [
      {
        data: [data.wins, data.losses, data.breakeven],
        backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)', 'rgba(99,102,241,0.8)'],
        borderColor: ['#10b981', '#ef4444', '#6366f1'],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 16, font: { size: 12 } },
      },
      tooltip: { ...tooltipDefaults },
    },
  };
  return (
    <div className="relative" style={{ height: 240 }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}

// ── Risk % Trend Line ─────────────────────────────────────────────────────────
export function RiskTrendChart({ data }) {
  if (!data || !data.length) return <EmptyChart />;

  const labels = data.map((d, i) => `T${i + 1}`);
  const values = data.map((d) => d.riskPercent);

  // Average reference line
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Risk %',
        data: values,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.08)',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#080810',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Avg Risk %',
        data: values.map(() => avg),
        borderColor: 'rgba(148,163,184,0.4)',
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', padding: 16, font: { size: 12 } },
      },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            return data[idx]?.instrument || items[0]?.label;
          },
          label: (item) => ` Risk: ${item.raw}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', font: { size: 11 } },
        grid: { color: 'rgba(30,30,48,0.8)' },
        border: { color: '#1e1e30' },
      },
      y: {
        ticks: {
          color: '#475569',
          font: { size: 11 },
          callback: (v) => `${v}%`,
        },
        grid: { color: 'rgba(30,30,48,0.8)' },
        border: { color: '#1e1e30' },
      },
    },
  };

  return (
    <div className="relative" style={{ height: 220 }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// ── Risk % by Trade (bar, coloured by outcome) ────────────────────────────────
export function RiskByTradeChart({ data }) {
  if (!data || !data.length) return <EmptyChart />;

  const labels = data.map((d, i) => d.instrument || `T${i + 1}`);
  const values = data.map((d) => d.riskPercent);
  const colors = data.map((d) =>
    d.outcome === 'Win'
      ? 'rgba(16,185,129,0.75)'
      : d.outcome === 'Loss'
      ? 'rgba(239,68,68,0.75)'
      : 'rgba(99,102,241,0.75)'
  );
  const borderColors = data.map((d) =>
    d.outcome === 'Win' ? '#10b981' : d.outcome === 'Loss' ? '#ef4444' : '#6366f1'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Risk %',
        data: values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label: (item) => {
            const d = data[item.dataIndex];
            return [` Risk: ${item.raw}%`, ` Outcome: ${d.outcome}`, d.actualPnL != null ? ` P&L: ${d.actualPnL >= 0 ? '+' : ''}${d.actualPnL}` : ''].filter(Boolean);
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', font: { size: 11 }, maxRotation: 45 },
        grid: { display: false },
        border: { color: '#1e1e30' },
      },
      y: {
        ticks: { color: '#475569', font: { size: 11 }, callback: (v) => `${v}%` },
        grid: { color: 'rgba(30,30,48,0.8)' },
        border: { color: '#1e1e30' },
      },
    },
  };

  return (
    <div className="relative" style={{ height: 220 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-40 text-text-muted text-sm">
      No data yet — add some trades to see charts.
    </div>
  );
}
