import { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { Room, UtilityRecord } from '@/data/types';

interface RoomData extends Room {
  waterUsage: number;
  waterCost: number;
  electricityUsage: number;
  electricityCost: number;
}

interface RoomTableProps {
  rooms: Room[];
  waterRecords: UtilityRecord[];
  electricityRecords: UtilityRecord[];
}

type SortField = 'roomNo' | 'floor' | 'waterUsage' | 'electricityUsage' | 'waterCost' | 'electricityCost';
type SortDir = 'asc' | 'desc';

export default function RoomTable({ rooms, waterRecords, electricityRecords }: RoomTableProps) {
  const [sortField, setSortField] = useState<SortField>('roomNo');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const data: RoomData[] = useMemo(() => {
    return rooms.map((room) => {
      const roomWater = waterRecords.filter((r) => r.roomId === room.id);
      const roomElectric = electricityRecords.filter((r) => r.roomId === room.id);
      return {
        ...room,
        waterUsage: Math.round(roomWater.reduce((s, r) => s + r.usage, 0) * 100) / 100,
        waterCost: Math.round(roomWater.reduce((s, r) => s + r.cost, 0) * 100) / 100,
        electricityUsage: Math.round(roomElectric.reduce((s, r) => s + r.usage, 0) * 100) / 100,
        electricityCost: Math.round(roomElectric.reduce((s, r) => s + r.cost, 0) * 100) / 100,
      };
    });
  }, [rooms, waterRecords, electricityRecords]);

  const sorted = useMemo(() => {
    const arr = [...data];
    arr.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return arr;
  }, [data, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const waterAverage = data.reduce((s, d) => s + d.waterUsage, 0) / data.length;
  const electricAverage = data.reduce((s, d) => s + d.electricityUsage, 0) / data.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-medium text-slate-700">房间水电数据明细</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th
                className="text-left px-5 py-3 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700"
                onClick={() => handleSort('roomNo')}
              >
                <span className="flex items-center gap-1">
                  房间号
                  <ArrowUpDown size={12} />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700"
                onClick={() => handleSort('floor')}
              >
                <span className="flex items-center gap-1">
                  楼层
                  <ArrowUpDown size={12} />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700"
                onClick={() => handleSort('waterUsage')}
              >
                <span className="flex items-center justify-end gap-1">
                  用水量(吨)
                  <ArrowUpDown size={12} />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700"
                onClick={() => handleSort('waterCost')}
              >
                <span className="flex items-center justify-end gap-1">
                  水费(元)
                  <ArrowUpDown size={12} />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700"
                onClick={() => handleSort('electricityUsage')}
              >
                <span className="flex items-center justify-end gap-1">
                  用电量(度)
                  <ArrowUpDown size={12} />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 text-xs text-slate-500 font-medium cursor-pointer hover:text-slate-700"
                onClick={() => handleSort('electricityCost')}
              >
                <span className="flex items-center justify-end gap-1">
                  电费(元)
                  <ArrowUpDown size={12} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-5 py-3 text-slate-700 font-medium">{row.roomNo}</td>
                <td className="px-4 py-3 text-slate-400">{row.floor}楼</td>
                <td className={`px-4 py-3 text-right font-mono ${row.waterUsage > waterAverage * 1.3 ? 'text-cyan-600 font-semibold' : 'text-slate-600'}`}>
                  {row.waterUsage.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-500">
                  {row.waterCost.toFixed(1)}
                </td>
                <td className={`px-4 py-3 text-right font-mono ${row.electricityUsage > electricAverage * 1.3 ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
                  {row.electricityUsage.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-500">
                  {row.electricityCost.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
