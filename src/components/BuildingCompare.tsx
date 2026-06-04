import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { getBuildingCompareData } from '@/data/mockData';

export default function BuildingCompare() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data] = useState(getBuildingCompareData());

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
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
      grid: { left: 56, right: 16, top: 36, bottom: 16 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLabel: { color: '#94a3b8', fontSize: 10, interval: 0, rotate: 20 },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
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
          type: 'bar',
          barWidth: '30%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#06b6d4' },
              { offset: 1, color: '#0891b2' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: data.map((d) => d.water),
        },
        {
          name: '用电量(度)',
          type: 'bar',
          barWidth: '30%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#d97706' },
            ]),
            borderRadius: [4, 4, 0, 0],
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
      <h3 className="text-sm font-medium text-slate-700 mb-4">各楼栋水电消耗对比</h3>
      <div ref={chartRef} className="w-full h-64" />
    </div>
  );
}
