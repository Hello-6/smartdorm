import { Bell } from 'lucide-react';
import AlertFilter from '@/components/AlertFilter';
import AlertList from '@/components/AlertList';

export default function AlertCenter() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-red-500" />
            <h1 className="text-lg font-semibold text-slate-800">异常告警中心</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">监控并处理宿舍水电异常告警</p>
        </div>
      </div>

      <AlertFilter />
      <AlertList />
    </div>
  );
}
