import { useState, useEffect } from 'react';
import { DoorOpen, Plus, Pencil, Trash2, X, Check, Filter } from 'lucide-react';
import { api } from '@/lib/api';

interface Building {
  id: number;
  name: string;
}

interface Room {
  id: number;
  roomNo: string;
  floor: number;
  buildingId: number;
  buildingName?: string;
}

export default function RoomManage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterBuildingId, setFilterBuildingId] = useState<number | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ roomNo: '', floor: '', buildingId: '' });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await api.getRooms(filterBuildingId);
      setRooms(data);
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
    fetchRooms();
  }, [filterBuildingId]);

  const resetForm = () => {
    setForm({ roomNo: '', floor: '', buildingId: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleCreate = async () => {
    if (!form.roomNo || !form.floor || !form.buildingId) return;
    setActionLoading(true);
    try {
      const data = await api.createRoom({
        buildingId: Number(form.buildingId),
        roomNo: form.roomNo,
        floor: Number(form.floor),
      });
      setRooms((prev) => [...prev, data]);
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!form.roomNo || !form.floor || !form.buildingId) return;
    setActionLoading(true);
    try {
      const data = await api.updateRoom(id, {
        roomNo: form.roomNo,
        floor: Number(form.floor),
        buildingId: Number(form.buildingId),
      });
      setRooms((prev) => prev.map((r) => (r.id === id ? data : r)));
      resetForm();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该房间吗？')) return;
    try {
      await api.deleteRoom(id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (room: Room) => {
    setEditId(room.id);
    setForm({ roomNo: room.roomNo, floor: String(room.floor), buildingId: String(room.buildingId) });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <DoorOpen size={18} className="text-cyan-400" />
            <h1 className="text-lg font-semibold text-slate-800">房间管理</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">管理宿舍房间信息</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200/60 shadow-sm rounded-lg px-3 py-1.5">
            <Filter size={14} className="text-slate-500" />
            <select
              value={filterBuildingId ?? ''}
              onChange={(e) => setFilterBuildingId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-slate-600 focus:outline-none"
            >
              <option value="">全部楼栋</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors border border-cyan-200"
          >
            <Plus size={14} />
            添加房间
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="房间号"
              value={form.roomNo}
              onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
              className="sm:w-28 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
            <input
              type="number"
              placeholder="楼层"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
              className="sm:w-24 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
            <select
              value={form.buildingId}
              onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="">选择楼栋</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
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

      <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60">
                <th className="text-left px-4 py-3 text-slate-500 font-medium">ID</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">房间号</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">楼层</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">所属楼栋</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    <span className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin inline-block" />
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">暂无房间数据</td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{room.id}</td>
                    <td className="px-4 py-3 text-slate-700">{room.roomNo}</td>
                    <td className="px-4 py-3 text-slate-500">{room.floor} 层</td>
                    <td className="px-4 py-3 text-slate-500">{room.buildingName || `楼栋 #${room.buildingId}`}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(room)}
                          className="p-1.5 rounded text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
