import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect, useRef } from 'react';
import { ArrowLeft, Building2, Droplets, Zap, TrendingUp, CircleDollarSign, Home, Wallet } from 'lucide-react';
import * as echarts from 'echarts';
import { getBuildings, getBuildingDetail } from '@/data/mockData';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import RoomTable from '@/components/RoomTable';
import DonutChart from '@/components/DonutChart';

function YearlyChart({ data, title, color, unit }: {
  data: { month: number; usage: number }[];
  title: string;
  color: string;
  unit: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(13, 26, 46, 0.9)',
        borderColor: 'rgba(0, 212, 255, 0.2)',
        textStyle: { color: '#e2e8f0', fontSize: 12 },
      },
      grid: { left: 40, right: 8, top: 8, bottom: 24 },
      xAxis: {
        type: 'category',
        data: data.map((d) => `${d.month}月`),
        axisLine: { lineStyle: { color: '#1f2937' } },
        axisLabel: { color: '#6b7280', fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#1f2937', type: 'dashed' } },
        axisLabel: { color: '#6b7280', fontSize: 10, formatter: `{value}${unit}` },
      },
      series: [{
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color },
            { offset: 1, color: color + '33' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        data: data.map((d) => d.usage),
      }],
    });
    const h = () => chart.resize();
    window.addEventListener('resize', h);
    return () => { chart.dispose(); window.removeEventListener('resize', h); };
  }, [data, color, unit]);

  return (
    <div className="bg-[#0d1a2e]/80 backdrop-blur-sm border border-gray-800/50 rounded-xl p-5">
      <h3 className="text-xs text-gray-500 mb-3">{title}</h3>
      <div ref={chartRef} className="w-full h-52" />
    </div>
  );
}

export default function DormitoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const buildingId = Number(id) || 1;

  const buildings = useMemo(() => getBuildings(), []);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const user = useAuthStore((s) => s.user);

  const userBuildingId = useMemo(() => {
    if (isAdmin()) return null;
    return user?.buildingId || null;
  }, [isAdmin, user]);

  const defaultBuildingId = userBuildingId || buildingId;
  const [selectedBuilding, setSelectedBuilding] = useState(defaultBuildingId);
  const detail = useMemo(() => getBuildingDetail(selectedBuilding), [selectedBuilding]);
  const building = buildings.find((b) => b.id === selectedBuilding);

  const [bill, setBill] = useState<any>(null);
  const [billLoading, setBillLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      api.getUserBill().then(setBill).finally(() => setBillLoading(false));
    }
  }, [isAdmin]);

  const waterDonutData = useMemo(() => {
    const floorData: Record<string, number> = {};
    detail.waterRecords.forEach((r) => {
      const room = detail.rooms.find((rm) => rm.id === r.roomId);
      if (room) {
        const key = `${room.floor}楼`;
        floorData[key] = (floorData[key] || 0) + r.usage;
      }
    });
    const colors = ['#00d4ff', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];
    return Object.entries(floorData).map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: colors[i % colors.length],
    }));
  }, [detail]);

  const electricDonutData = useMemo(() => {
    const floorData: Record<string, number> = {};
    detail.electricityRecords.forEach((r) => {
      const room = detail.rooms.find((rm) => rm.id === r.roomId);
      if (room) {
        const key = `${room.floor}楼`;
        floorData[key] = (floorData[key] || 0) + r.usage;
      }
    });
    const colors = ['#f59e0b', '#d97706', '#ea580c', '#dc2626', '#e11d48', '#db2777'];
    return Object.entries(floorData).map(([name, value], i) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: colors[i % colors.length],
    }));
  }, [detail]);

  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft size={14} />
          返回首页
        </button>

        <div className="flex items-center justify-between">
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

        {billLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : !bill?.building ? (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-16 text-center">
            <p className="text-slate-500 text-sm">暂无数据，请联系管理员</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
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
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-cyan-400" />
              <h1 className="text-lg font-semibold text-slate-800">{building?.name || '楼栋详情'}</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">共 {detail.rooms.length} 个房间 · 本月数据统计</p>
          </div>
        </div>
        <div className="flex gap-1 bg-white rounded-lg border border-slate-200/60 shadow-sm p-1">
          {buildings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBuilding(b.id)}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${selectedBuilding === b.id ? 'bg-cyan-50 text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs text-slate-400 mb-1">总用水量</p>
          <p className="text-xl font-semibold text-slate-800">{Math.round(detail.waterRecords.reduce((s, r) => s + r.usage, 0) * 100) / 100}<span className="text-xs text-slate-400 ml-1">吨</span></p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs text-slate-400 mb-1">总用电量</p>
          <p className="text-xl font-semibold text-slate-800">{Math.round(detail.electricityRecords.reduce((s, r) => s + r.usage, 0) * 100) / 100}<span className="text-xs text-slate-400 ml-1">度</span></p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs text-slate-400 mb-1">平均用水/房间</p>
          <p className="text-xl font-semibold text-slate-800">{(detail.waterRecords.reduce((s, r) => s + r.usage, 0) / detail.rooms.length || 0).toFixed(1)}<span className="text-xs text-slate-400 ml-1">吨</span></p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <p className="text-xs text-slate-400 mb-1">平均用电/房间</p>
          <p className="text-xl font-semibold text-slate-800">{(detail.electricityRecords.reduce((s, r) => s + r.usage, 0) / detail.rooms.length || 0).toFixed(1)}<span className="text-xs text-slate-400 ml-1">度</span></p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3">
          <RoomTable rooms={detail.rooms} waterRecords={detail.waterRecords} electricityRecords={detail.electricityRecords} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <DonutChart data={waterDonutData} title="各楼层用水分布" />
          <DonutChart data={electricDonutData} title="各楼层用电分布" />
        </div>
      </div>
    </div>
  );
}
