import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check, Building2 as BuildingIcon } from 'lucide-react';
import { api } from '@/lib/api';

interface Building {
  id: number;
  name: string;
  totalRooms: number;
}

export default function BuildingManage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', totalRooms: '' });

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminBuildings();
      setBuildings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const resetForm = () => {
    setForm({ name: '', totalRooms: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleCreate = async () => {
    if (!form.name || !form.totalRooms) return;
    setActionLoading(true);
    try {
      const data = await api.createBuilding({ name: form.name, totalRooms: Number(form.totalRooms) });
      setBuildings((prev) => [...prev, data]);
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!form.name || !form.totalRooms) return;
    setActionLoading(true);
    try {
      const data = await api.updateBuilding(id, { name: form.name, totalRooms: Number(form.totalRooms) });
      setBuildings((prev) => prev.map((b) => (b.id === id ? data : b)));
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该楼栋吗？删除后关联的房间和记录数据将被清除。')) return;
    try {
      await api.deleteBuilding(id);
      setBuildings((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (building: Building) => {
    setEditId(building.id);
    setForm({ name: building.name, totalRooms: String(building.totalRooms) });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BuildingIcon size={18} className="text-cyan-400" />
            <h1 className="text-lg font-semibold text-slate-800">楼栋管理</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">管理宿舍楼栋信息</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors border border-cyan-200"
        >
          <Plus size={14} />
          添加楼栋
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="楼栋名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
            <input
              type="number"
              placeholder="总房间数"
              value={form.totalRooms}
              onChange={(e) => setForm({ ...form, totalRooms: e.target.value })}
              className="sm:w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
            <button
              onClick={() => editId ? handleUpdate(editId) : handleCreate()}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors border border-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? <span className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /> : <Check size={14} />}
              {editId ? '保存' : '创建'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-400 rounded-lg text-xs hover:text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <X size={14} />
              取消
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <span className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : buildings.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm">暂无楼栋数据</div>
        ) : (
          buildings.map((building) => (
            <div key={building.id} className="bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 hover:border-slate-300/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-slate-700">{building.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">ID: {building.id}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(building)}
                    className="p-1.5 rounded text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(building.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">总房间数:</span>
                <span className="text-cyan-400 font-medium">{building.totalRooms}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
