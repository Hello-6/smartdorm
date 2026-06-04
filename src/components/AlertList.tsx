import { useState, useMemo } from 'react';
import { Zap, Droplets, CheckCircle2, XCircle } from 'lucide-react';
import type { AnomalyAlert } from '@/data/types';
import { getAlerts, getBuildings } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

const severityConfig = {
  high: { color: 'border-red-400/40 bg-red-50/50', dot: 'bg-red-500', label: '严重' },
  mid: { color: 'border-orange-400/40 bg-orange-50/50', dot: 'bg-orange-500', label: '中等' },
  low: { color: 'border-yellow-400/40 bg-yellow-50/50', dot: 'bg-yellow-500', label: '轻微' },
};

export default function AlertList() {
  const [alerts] = useState(getAlerts().sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()));
  const filter = useAppStore((s) => s.alertFilter);
  const [localStatus, setLocalStatus] = useState<Record<number, AnomalyAlert['status']>>({});

  const buildings = useMemo(() => getBuildings(), []);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const userBuilding = useMemo(() => {
    if (!user || !user.buildingId) return null;
    return buildings.find(b => b.id === user.buildingId) || null;
  }, [user, buildings]);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      const status = localStatus[a.id] || a.status;
      if (filter.type !== 'all' && a.type !== filter.type) return false;
      if (filter.buildingId !== null) {
        const building = buildings.find(b => b.id === filter.buildingId);
        if (!building || a.buildingName !== building.name) return false;
      }
      if (filter.severity !== 'all' && a.severity !== filter.severity) return false;
      if (filter.status !== 'all' && status !== filter.status) return false;
      if (!isAdmin() && userBuilding && a.buildingName !== userBuilding.name) return false;
      return true;
    });
  }, [alerts, filter, localStatus, buildings, isAdmin, userBuilding]);

  const handleStatusChange = (alertId: number, newStatus: AnomalyAlert['status']) => {
    setLocalStatus((prev) => ({ ...prev, [alertId]: newStatus }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-medium text-slate-700">告警记录</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-400 text-sm">
            暂无符合条件的告警记录
          </div>
        ) : (
          filtered.map((alert) => {
            const status = localStatus[alert.id] || alert.status;
            const config = severityConfig[alert.severity];
            return (
              <div key={alert.id} className={`px-5 py-4 border-l-2 ${config.color}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {alert.type === 'water' ? (
                          <Droplets size={14} className="text-cyan-500" />
                        ) : (
                          <Zap size={14} className="text-yellow-500" />
                        )}
                        <span className="text-xs text-slate-500">
                          {alert.buildingName}
                        </span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{alert.roomNo}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          alert.severity === 'high' ? 'bg-red-50 text-red-600' :
                          alert.severity === 'mid' ? 'bg-orange-50 text-orange-600' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{alert.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(alert.detectedAt).toLocaleString('zh-CN', {
                          month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(alert.id, 'resolved')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-emerald-600 hover:bg-emerald-50 transition-all"
                        >
                          <CheckCircle2 size={12} />
                          已处理
                        </button>
                        <button
                          onClick={() => handleStatusChange(alert.id, 'ignored')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          <XCircle size={12} />
                          忽略
                        </button>
                      </>
                    )}
                    {status === 'resolved' && (
                      <span className="text-xs text-emerald-500/70">✓ 已处理</span>
                    )}
                    {status === 'ignored' && (
                      <span className="text-xs text-slate-400">已忽略</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
