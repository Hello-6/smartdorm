import { useState, useEffect } from 'react';
import { Users, Pencil, Trash2, X, Check, Plus, UserPlus, Home } from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
  role: string;
  buildingId: number | null;
  buildingName: string | null;
  createdAt: string;
}

interface Building {
  id: number;
  name: string;
}

export default function UserManage() {
  const [users, setUsers] = useState<User[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ username: '', buildingId: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', buildingId: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [u, b] = await Promise.all([api.getUsers(), api.getAdminBuildings()]);
      setUsers(u);
      setBuildings(b);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除该用户吗？')) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setEditForm({ username: user.username, buildingId: user.buildingId ? String(user.buildingId) : '' });
  };

  const handleSave = async (id: number) => {
    try {
      await api.updateUser(id, {
        username: editForm.username,
        buildingId: editForm.buildingId ? Number(editForm.buildingId) : null,
      });
      fetchData();
      setEditId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!createForm.username || !createForm.password) return;
    setActionLoading(true);
    try {
      await api.createUser({
        username: createForm.username,
        password: createForm.password,
        buildingId: createForm.buildingId ? Number(createForm.buildingId) : null,
      });
      fetchData();
      setShowCreate(false);
      setCreateForm({ username: '', password: '', buildingId: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelEdit = () => setEditId(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
            <h1 className="text-lg font-semibold text-slate-800">用户管理</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">管理员可创建、编辑、删除用户账号</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">共 {users.length} 个用户</span>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors border border-cyan-200"
          >
            <UserPlus size={14} />
            创建用户
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-white border border-slate-200/60 shadow-sm rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="用户名"
              value={createForm.username}
              onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              className="sm:w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
            <input
              type="password"
              placeholder="密码"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              className="sm:w-32 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500 placeholder-slate-400"
            />
            <select
              value={createForm.buildingId}
              onChange={(e) => setCreateForm({ ...createForm, buildingId: e.target.value })}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-cyan-500"
            >
              <option value="">选择楼栋</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button onClick={handleCreate} disabled={actionLoading} className="flex items-center gap-1.5 px-3 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium hover:bg-cyan-100 transition-colors border border-cyan-200 disabled:opacity-50 disabled:cursor-not-allowed">
              {actionLoading ? <span className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" /> : <Check size={14} />}
              创建
            </button>
            <button onClick={() => { setShowCreate(false); setCreateForm({ username: '', password: '', buildingId: '' }); }} className="flex items-center gap-1.5 px-3 py-2 text-slate-400 rounded-lg text-xs hover:text-slate-600 hover:bg-slate-50 transition-colors">
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
                <th className="text-left px-4 py-3 text-slate-500 font-medium">用户名</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">角色</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">宿舍</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">注册时间</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400"><span className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin inline-block" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">暂无用户数据</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600">{user.id}</td>
                    <td className="px-4 py-3">
                      {editId === user.id ? (
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 sm:w-32 focus:outline-none focus:border-cyan-500"
                        />
                      ) : (
                        <span className="text-slate-700">{user.username}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-cyan-50 text-cyan-600' : 'bg-slate-100 text-slate-500'}`}>
                        {user.role === 'admin' ? '管理员' : '用户'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editId === user.id ? (
                        <input
                          type="text"
                          value={editForm.buildingId}
                          onChange={(e) => setEditForm({ ...editForm, buildingId: e.target.value })}
                          placeholder="楼栋ID"
                          className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 sm:w-20 focus:outline-none focus:border-cyan-500"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                          <Home size={12} />
                          {user.buildingName || (user.buildingId ? `#${user.buildingId}` : '-')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{user.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      {editId === user.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleSave(user.id)} className="p-1.5 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"><Check size={14} /></button>
                          <button onClick={cancelEdit} className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(user)} className="p-1.5 rounded text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      )}
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
