import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Zap, UserPlus, Eye, EyeOff, Home } from 'lucide-react';
import { api } from '@/lib/api';

interface Building {
  id: number;
  name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [buildingId, setBuildingId] = useState<number | ''>('');
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import('echarts');
    api.getBuildings()
      .then(setBuildings)
      .catch(() => {
        setError('获取楼栋列表失败');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少6位');
      return;
    }
    if (!buildingId) {
      setError('请选择所在楼栋');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.register({ username, password, buildingId: Number(buildingId) });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 mb-4 shadow-lg">
            <Home size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">智慧公寓</h1>
          <p className="text-sm text-slate-400 mt-1">创建新账号，加入智慧公寓</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（至少6位）"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">确认密码</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">所在楼栋</label>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 transition-all appearance-none"
              >
                <option value="">请选择楼栋</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:from-emerald-300 disabled:to-teal-300 text-white rounded-xl py-3 text-sm font-medium transition-all shadow-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? '注册中...' : '注 册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              已有账号？{' '}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Home size={12} />
            <span className="text-[10px]">智慧公寓</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets size={12} />
            <span className="text-[10px]">用水监控</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={12} />
            <span className="text-[10px]">用电监控</span>
          </div>
        </div>
      </div>
    </div>
  );
}
