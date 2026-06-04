import { useState, useEffect, useRef } from 'react';
import { Droplets, Zap, TrendingUp, CircleDollarSign, Home, AlertTriangle } from 'lucide-react';
import * as echarts from 'echarts';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { getDashboardStats } from '@/data/mockData';
import TrendChart from '@/components/TrendChart';

function interpolateColor(color1: string, color2: string, ratio: number): string {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3)), g1 = hex(color1.slice(3, 5)), b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3)), g2 = hex(color2.slice(3, 5)), b2 = hex(color2.slice(5, 7));
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r},${g},${b})`;
}

function YearlyChart({ data, label, color, lightColor }: {
  data: { month: number; usage: number }[];
  label: string;
  color: string;
  lightColor: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#334155', fontSize: 11 },
        formatter: (params: any) => {
          const p = params[0];
          return `<strong>${p.axisValue}</strong><br/>${label}：${p.value.toFixed(1)}`;
        },
      },
      grid: { left: 36, right: 8, top: 8, bottom: 20 },
      xAxis: {
        type: 'category',
        data: data.map((d) => `${d.month}月`),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
      },
      series: [{
        type: 'bar',
        barWidth: '55%',
        data: data.map((d, i) => ({
          value: d.usage,
          itemStyle: {
            color: interpolateColor(lightColor, color, i / Math.max(data.length - 1, 1)),
            borderRadius: [4, 4, 0, 0],
          },
        })),
      }],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { chart.dispose(); window.removeEventListener('resize', h); };
  }, [data, color, label, lightColor]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
      <h3 className="text-xs font-medium text-slate-500 mb-3">{label}</h3>
      <div ref={chartRef} className="w-full h-44" />
    </div>
  );
}

function PaymentModal({ waterCost, electricCost, totalCost, onClose, onSuccess }: {
  waterCost: number;
  electricCost: number;
  totalCost: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<'confirm' | 'paying' | 'done'>('confirm');
  const [method, setMethod] = useState<'wechat' | 'alipay'>('wechat');

  const handlePay = async () => {
    setStep('paying');
    await new Promise(r => setTimeout(r, 2000));
    setStep('done');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden" onClick={e => e.stopPropagation()}>

        {step === 'confirm' && (
          <>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-10 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <CircleDollarSign size={24} className="text-white" />
              </div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">本月待缴</p>
              <p className="text-4xl font-bold text-white">¥{totalCost.toFixed(2)}</p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">水费</span>
                  <span className="text-slate-700 font-medium">¥{waterCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">电费</span>
                  <span className="text-slate-700 font-medium">¥{electricCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
                  <span className="text-slate-700 font-medium">合计</span>
                  <span className="text-emerald-600 font-bold">¥{totalCost.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium">选择支付方式</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod('wechat')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    method === 'wechat'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045.247.247 0 00.242-.246c0-.06-.024-.12-.04-.177l-.325-1.233a.492.492 0 01.178-.553C23.028 18.333 24 16.592 24 14.628c0-3.299-3.063-5.77-7.062-5.77zm-2.18 2.453c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.36 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/></svg>
                  微信支付
                </button>
                <button
                  onClick={() => setMethod('alipay')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    method === 'alipay'
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.422 15.358c-3.22-1.386-6.847-2.204-10.299-2.204-.468 0-.934.018-1.4.054.815-1.635 1.945-3.413 3.254-4.948 0 0-6.832 1.32-10.964 4.18-2.043 1.418-3.312 3.155-3.312 5.067 0 2.24 1.994 4.086 5.262 4.493 2.007.25 4.237-.006 6.343-1.153 2.165-1.18 4.41-3.336 6.229-5.512.93-1.112 1.732-2.25 2.315-3.334-1.05.597-2.24 1.134-3.47 1.562l.009-.006zm-5.081.376l.001-.002zm.048.22h.002-.002zm-4.168 1.076c.088.074.18.146.275.216l-.275-.216zm-2.812-1.688s-.436 1.05-1.22 1.995c-.296.358-.664.692-1.08.964a7.9 7.9 0 01-1.416.824 6.39 6.39 0 01-1.456.477c-.79.161-1.55.109-2.09-.196-.488-.274-.74-.707-.74-1.284 0-.434.168-.872.476-1.262.608-.771 1.81-1.617 3.03-2.03a14.55 14.55 0 014.496-.488v.001z"/></svg>
                  支付宝
                </button>
              </div>

              <button
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-3 text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-sm"
              >
                确认支付 ¥{totalCost.toFixed(2)}
              </button>
              <button onClick={onClose} className="w-full text-xs text-slate-400 hover:text-slate-600 py-1 transition-colors">
                取消
              </button>
            </div>
          </>
        )}

        {step === 'paying' && (
          <div className="px-6 py-16 text-center">
            <span className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin block mx-auto mb-4" />
            <p className="text-slate-700 font-medium mb-1">支付处理中...</p>
            <p className="text-xs text-slate-400">请稍候，正在为您完成缴费</p>
          </div>
        )}

        {step === 'done' && (
          <div className="px-6 py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-800 mb-1">缴费成功</p>
            <p className="text-sm text-slate-400 mb-2">¥{totalCost.toFixed(2)} 已缴纳</p>
            <p className="text-[10px] text-slate-300 mb-6">缴费周期：{new Date().getFullYear()}年{new Date().getMonth() + 1}月</p>
            <button
              onClick={onSuccess}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-sm"
            >
              完成
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function Dashboard() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const user = useAuthStore((s) => s.user);
  const stats = getDashboardStats();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      api.getUserBill().then(setBill).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700">
                <Home size={11} />
                {bill?.building?.name || '宿舍'}
              </span>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] text-slate-400">{new Date().getFullYear()}年{new Date().getMonth() + 1}月</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800 mt-0.5">数据概览</h1>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
            <Home size={18} className="text-white" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : !bill?.building ? (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-16 text-center">
            <p className="text-slate-500 text-sm">暂无数据，请联系管理员</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <Droplets size={16} className="text-cyan-500" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">本月用水</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {bill.totalWaterUsage.toFixed(1)}
                  <span className="text-sm font-normal text-slate-400 ml-1">吨</span>
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp size={12} className="text-cyan-400" />
                  <span className="text-[11px] text-cyan-500">费用 ¥{bill.totalWaterCost.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Zap size={16} className="text-amber-500" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">本月用电</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {bill.totalElectricUsage.toFixed(1)}
                  <span className="text-sm font-normal text-slate-400 ml-1">度</span>
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <TrendingUp size={12} className="text-amber-400" />
                  <span className="text-[11px] text-amber-500">费用 ¥{bill.totalElectricCost.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/60 shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CircleDollarSign size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-emerald-600/70 uppercase tracking-wider">待缴费</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-0.5">¥{bill.totalCost.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500">水费 ¥{bill.totalWaterCost.toFixed(2)}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">电费 ¥{bill.totalElectricCost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-3.5 text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              立即缴费 ¥{bill.totalCost.toFixed(2)}
            </button>

            {showPayment && (
              <PaymentModal
                waterCost={bill.totalWaterCost}
                electricCost={bill.totalElectricCost}
                totalCost={bill.totalCost}
                onClose={() => setShowPayment(false)}
                onSuccess={() => setShowPayment(false)}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <YearlyChart
                data={bill.yearlyWater}
                label={`${new Date().getFullYear()}年用水量`}
                color="#06b6d4"
                lightColor="#e0f2fe"
              />
              <YearlyChart
                data={bill.yearlyElectric}
                label={`${new Date().getFullYear()}年用电量`}
                color="#f59e0b"
                lightColor="#fef3c7"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">数据概览</h1>
          <p className="text-xs text-slate-400 mt-1">智慧公寓 · 能耗看板</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          系统运行正常
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
            <Droplets size={18} className="text-cyan-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">本月总用水量</p>
            <p className="text-xl font-semibold text-slate-800">{stats.totalWaterUsage}<span className="text-xs text-slate-400 ml-1">吨</span></p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp size={11} className="text-cyan-400" />
              <span className="text-[10px] text-cyan-500">{stats.waterTrend > 0 ? '+' : ''}{stats.waterTrend}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">本月总用电量</p>
            <p className="text-xl font-semibold text-slate-800">{stats.totalElectricityUsage}<span className="text-xs text-slate-400 ml-1">度</span></p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp size={11} className="text-amber-400" />
              <span className="text-[10px] text-amber-500">{stats.electricityTrend > 0 ? '+' : ''}{stats.electricityTrend}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CircleDollarSign size={18} className="text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">本月总费用</p>
            <p className="text-xl font-semibold text-slate-800">{stats.totalCost}<span className="text-xs text-slate-400 ml-1">元</span></p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">待处理异常</p>
            <p className="text-xl font-semibold text-slate-800">{stats.anomalyCount}<span className="text-xs text-slate-400 ml-1">条</span></p>
          </div>
        </div>
      </div>

      <TrendChart />
    </div>
  );
}
