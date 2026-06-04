import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  height?: number;
}

export default function DonutChart({ data, title, height = 220 }: DonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        textStyle: { color: '#475569', fontSize: 12 },
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['10%', '70%'],
          avoidLabelOverlap: true,
          padAngle: 1.5,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'inner',
            formatter: (params: any) => {
              return params.percent > 6 ? `${params.percent}%` : '';
            },
            color: '#ffffff',
            fontSize: 15,
            fontWeight: 800,
            fontFamily: 'Arial, sans-serif',
            textShadowBlur: 6,
            textShadowColor: 'rgba(0,0,0,0.45)',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.15)',
            },
          },
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color },
          })),
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
      <h3 className="text-sm font-medium text-slate-700 mb-2">{title}</h3>
      <div ref={chartRef} style={{ width: '100%', height }} />
    </div>
  );
}
