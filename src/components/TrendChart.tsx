import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { getTrendData, timeRanges } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';

export default function TrendChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const currentTimeRange = useAppStore((s) => s.currentTimeRange);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const [data, setData] = useState(getTrendData(7));

  useEffect(() => {
    setData(getTrendData(currentTimeRange));
  }, [currentTimeRange]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#334155', fontSize: 12 },
      },
      legend: {
        data: ['用水量(吨)', '用电量(度)'],
        textStyle: { color: '#64748b', fontSize: 11 },
        top: 0,
        right: 0,
      },
      grid: { left: 40, right: 16, top: 36, bottom: 20 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
      },
      series: [
        {
          name: '用水量(吨)',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#06b6d4' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(6, 182, 212, 0.15)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.01)' },
            ]),
          },
          data: data.map((d) => d.water),
        },
        {
          name: '用电量(度)',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#f59e0b' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 158, 11, 0.12)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.01)' },
            ]),
          },
          data: data.map((d) => d.electricity),
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-700">水电消耗趋势</h3>
        <div className="flex gap-1">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${
                currentTimeRange === range.value
                  ? 'bg-cyan-50 text-cyan-600 border border-cyan-200 font-medium'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartRef} className="w-full h-64" />
    </div>
  );
}
