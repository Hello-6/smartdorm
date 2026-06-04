import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import UserLayout from "@/components/UserLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { useAuthStore } from "@/store/useAuthStore";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DormitoryDetail = lazy(() => import("@/pages/DormitoryDetail"));
const AlertCenter = lazy(() => import("@/pages/AlertCenter"));
const UserManage = lazy(() => import("@/pages/admin/UserManage"));
const BuildingManage = lazy(() => import("@/pages/admin/BuildingManage"));
const RoomManage = lazy(() => import("@/pages/admin/RoomManage"));
const RecordManage = lazy(() => import("@/pages/admin/RecordManage"));
const AlertManage = lazy(() => import("@/pages/admin/AlertManage"));

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg mb-4 animate-pulse">
        <span className="text-white text-lg font-bold">SD</span>
      </div>
      <p className="text-sm text-slate-400">SmartDorm</p>
      <div className="flex items-center gap-1 mt-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0s' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Suspense fallback={<Loader />}><DashboardPage /></Suspense></ProtectedRoute>} />
        <Route path="/dormitory/:id" element={<ProtectedRoute><Suspense fallback={<Loader />}><DormitoryPage /></Suspense></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute adminOnly><Layout><Suspense fallback={<Loader />}><AlertCenter /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><Layout><Suspense fallback={<Loader />}><UserManage /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/admin/buildings" element={<ProtectedRoute adminOnly><Layout><Suspense fallback={<Loader />}><BuildingManage /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute adminOnly><Layout><Suspense fallback={<Loader />}><RoomManage /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/admin/records" element={<ProtectedRoute adminOnly><Layout><Suspense fallback={<Loader />}><RecordManage /></Suspense></Layout></ProtectedRoute>} />
        <Route path="/admin/alerts" element={<ProtectedRoute adminOnly><Layout><Suspense fallback={<Loader />}><AlertManage /></Suspense></Layout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

function DashboardPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (isAdmin()) return <Layout><Dashboard /></Layout>;
  return <UserLayout><Dashboard /></UserLayout>;
}

function DormitoryPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  if (isAdmin()) return <Layout><DormitoryDetail /></Layout>;
  return <UserLayout><DormitoryDetail /></UserLayout>;
}
