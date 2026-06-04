import { AlertTriangle } from 'lucide-react';
import { getAlerts } from '@/data/mockData';
import { useMemo } from 'react';

export default function AnomalyBanner() {
  const pendingAlerts = useMemo(() => getAlerts().filter((a) => a.status === 'pending'), []);

  if (pendingAlerts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-xl px-5 py-3 flex items-center gap-3 overflow-hidden">
      <AlertTriangle size={18} className="text-red-400 flex-shrink-0 animate-pulse" />
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-8 animate-scroll" style={{ animationDuration: '20s' }}>
          {[...pendingAlerts, ...pendingAlerts].map((alert, i) => (
            <span key={i} className="text-xs text-red-300 whitespace-nowrap">
              {alert.description}
            </span>
          ))}
        </div>
      </div>
      <span className="text-xs text-red-400 flex-shrink-0">
        共 {pendingAlerts.length} 条待处理
      </span>
    </div>
  );
}
