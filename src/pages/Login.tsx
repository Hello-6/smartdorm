import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Zap, Eye, EyeOff, LogIn, Home } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    import('echarts');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.login(username, password);
      setAuth(data.user, data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
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
          <p className="text-sm text-slate-400 mt-1">登录您的账号</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">用户名</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
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
                <LogIn size={16} />
              )}
              {loading ? '登录中...' : '登 录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              还没有账号？{' '}
              <Link to="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 text-slate-400 flex-wrap">
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
