import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({ title, value, unit, trend, trendLabel, icon, color }: StatCardProps) {
  return (
    <div className="bg-[#0d1a2e]/80 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1.5">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`flex items-center text-xs ${trend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(trend).toFixed(1)}%
              </span>
              {trendLabel && <span className="text-xs text-gray-600">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
