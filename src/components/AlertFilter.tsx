import { useMemo } from 'react';
import { getBuildings } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function AlertFilter() {
  const filter = useAppStore((s) => s.alertFilter);
  const setAlertFilter = useAppStore((s) => s.setAlertFilter);
  const buildings = useMemo(() => getBuildings(), []);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const availableBuildings = useMemo(() => {
    if (isAdmin()) return buildings;
    if (user?.buildingId) {
      const b = buildings.find(b => b.id === user.buildingId);
      return b ? [b] : [];
    }
    return [];
  }, [buildings, isAdmin, user]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">类型</span>
          <select
            value={filter.type}
            onChange={(e) => setAlertFilter({ type: e.target.value as typeof filter.type })}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-emerald-300"
          >
            <option value="all">全部</option>
            <option value="water">用水异常</option>
            <option value="electricity">用电异常</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">楼栋</span>
          <select
            value={isAdmin() ? (filter.buildingId ?? '') : (user?.buildingId ?? '')}
            onChange={(e) => setAlertFilter({ buildingId: e.target.value ? Number(e.target.value) : null })}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-emerald-300"
            disabled={!isAdmin()}
          >
            <option value="">全部楼栋</option>
            {availableBuildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">严重程度</span>
          <select
            value={filter.severity}
            onChange={(e) => setAlertFilter({ severity: e.target.value as typeof filter.severity })}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-emerald-300"
          >
            <option value="all">全部</option>
            <option value="high">严重</option>
            <option value="mid">中等</option>
            <option value="low">轻微</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">状态</span>
          <select
            value={filter.status}
            onChange={(e) => setAlertFilter({ status: e.target.value as typeof filter.status })}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-emerald-300"
          >
            <option value="all">全部</option>
            <option value="pending">待处理</option>
            <option value="resolved">已处理</option>
            <option value="ignored">已忽略</option>
          </select>
        </div>
      </div>
    </div>
  );
}
