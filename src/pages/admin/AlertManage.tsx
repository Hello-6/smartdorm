import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface AlertItem {
  id: number;
  type: string;
  message: string;
  status: string;
  roomNo?: string;
  buildingName?: string;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  pending: '待处理',
  resolved: '已解决',
  ignored: '已忽略',
};

const statusColors: Record<string, string> = {
  pending: 'bg-red-50 text-red-500',
  resolved: 'bg-emerald-50 text-emerald-600',
  ignored: 'bg-slate-100 text-slate-500',
};

const typeLabels: Record<string, string> = {
  water: '用水异常',
  electricity: '用电异常',
};

export default function AlertManage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAllAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该告警吗？')) return;
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAlerts = statusFilter
    ? alerts.filter((a) => a.status === statusFilter)
    : alerts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h1 className="text-lg font-semibold text-slate-800">告警管理</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">查看和管理所有系统告警</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200/60 shadow-sm rounded-lg px-3 py-1.5">
          <Filter size={14} className="text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-600 focus:outline-none"
          >
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="resolved">已解决</option>
            <option value="ignored">已忽略</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">类型</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">消息</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">房间</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">楼栋</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">状态</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">时间</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <span className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin inline-block" />
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">暂无告警数据</td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{alert.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${alert.type === 'water' ? 'bg-cyan-50 text-cyan-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {typeLabels[alert.type] || alert.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{alert.message}</td>
                    <td className="px-4 py-3 text-slate-500">{alert.roomNo || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{alert.buildingName || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[alert.status] || 'bg-slate-100 text-slate-500'}`}>
                        {statusLabels[alert.status] || alert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{alert.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
