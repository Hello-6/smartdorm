import { useState, useEffect } from 'react';
import { ClipboardList, Droplets, Zap, Trash2, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface Building {
  id: number;
  name: string;
}

interface Record {
  id: number;
  roomId: number;
  roomNo?: string;
  buildingName?: string;
  usage: number;
  cost: number;
  recordDate: string;
}

export default function RecordManage() {
  const [tab, setTab] = useState<'water' | 'electricity'>('water');
  const [records, setRecords] = useState<Record[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterRoomId, setFilterRoomId] = useState<number | undefined>(undefined);
  const [filterRoomInput, setFilterRoomInput] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = tab === 'water'
        ? await api.getWaterRecords(filterRoomId)
        : await api.getElectricityRecords(filterRoomId);
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const data = await api.getAdminBuildings();
      setBuildings(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [tab, filterRoomId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该记录吗？')) return;
    try {
      await api.deleteRecord(tab, id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterRoom = () => {
    setActionLoading(true);
    setFilterRoomId(filterRoomInput ? Number(filterRoomInput) : undefined);
    setTimeout(() => setActionLoading(false), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-cyan-400" />
            <h1 className="text-lg font-semibold text-slate-800">数据管理</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">查看和管理水电使用记录</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="flex bg-white border border-slate-200/60 shadow-sm rounded-lg overflow-hidden">
          <button
            onClick={() => setTab('water')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${
              tab === 'water'
                ? 'bg-cyan-50 text-cyan-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Droplets size={14} />
            用水记录
          </button>
          <button
            onClick={() => setTab('electricity')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${
              tab === 'electricity'
                ? 'bg-yellow-50 text-yellow-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Zap size={14} />
            用电记录
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200/60 shadow-sm rounded-lg px-3 py-1.5">
          <Filter size={14} className="text-slate-500" />
          <input
            type="number"
            placeholder="房间ID筛选"
            value={filterRoomInput}
            onChange={(e) => setFilterRoomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterRoom()}
            className="sm:w-24 bg-transparent text-slate-600 focus:outline-none placeholder-slate-400"
          />
          <button
            onClick={handleFilterRoom}
            disabled={actionLoading}
            className="text-cyan-600 hover:text-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? <span className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin inline-block align-middle" /> : '筛选'}
          </button>
          {filterRoomId && (
            <button
              onClick={() => { setFilterRoomId(undefined); setFilterRoomInput(''); }}
              className="text-slate-400 hover:text-slate-600"
            >
              清除
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">房间</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">楼栋</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">用量</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">费用</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">日期</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <span className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin inline-block" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">暂无记录</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{record.id}</td>
                    <td className="px-4 py-3 text-slate-700">{record.roomNo || `房间 #${record.roomId}`}</td>
                    <td className="px-4 py-3 text-slate-500">{record.buildingName || '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {record.usage}
                      <span className="text-xs text-slate-400 ml-1">{tab === 'water' ? '吨' : '度'}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {record.cost}
                      <span className="text-xs text-slate-400 ml-1">元</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{record.recordDate}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
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
