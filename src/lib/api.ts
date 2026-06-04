const API_BASE = '/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '请求失败' }));
    throw new Error(err.message || '请求失败');
  }
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: { username: string; password: string; buildingId: number }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getStats: () => request('/stats'),
  getTrend: (days: number) => request(`/trend?days=${days}`),
  getBuildingCompare: () => request('/buildings/compare'),
  getBuildings: () => request('/buildings/public'),
  getBuildingDetail: (id: number) => request(`/buildings/${id}/detail`),
  getAlerts: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/alerts${qs}`);
  },
  updateAlertStatus: (id: number, status: string) =>
    request(`/alerts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getUserBill: () => request('/user-bill'),
  submitPayment: () => request('/user/pay', { method: 'POST' }),

  // === Admin CRUD ===
  getUsers: () => request('/admin/users'),
  createUser: (data: { username: string; password: string; buildingId: number | null }) =>
    request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id: number) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  updateUser: (id: number, data: { username: string; buildingId: number | null }) =>
    request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getAdminBuildings: () => request('/buildings'),
  createBuilding: (data: { name: string; totalRooms: number }) =>
    request('/admin/buildings', { method: 'POST', body: JSON.stringify(data) }),
  updateBuilding: (id: number, data: { name: string; totalRooms: number }) =>
    request(`/admin/buildings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBuilding: (id: number) => request(`/admin/buildings/${id}`, { method: 'DELETE' }),

  getRooms: (buildingId?: number) =>
    request(`/admin/rooms${buildingId ? `?buildingId=${buildingId}` : ''}`),
  createRoom: (data: { buildingId: number; roomNo: string; floor: number }) =>
    request('/admin/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (id: number, data: { roomNo: string; floor: number; buildingId: number }) =>
    request(`/admin/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoom: (id: number) => request(`/admin/rooms/${id}`, { method: 'DELETE' }),

  getWaterRecords: (roomId?: number) =>
    request(`/admin/records/water${roomId ? `?roomId=${roomId}` : ''}`),
  getElectricityRecords: (roomId?: number) =>
    request(`/admin/records/electricity${roomId ? `?roomId=${roomId}` : ''}`),
  deleteRecord: (type: string, id: number) =>
    request(`/admin/records/${type}/${id}`, { method: 'DELETE' }),

  getAllAlerts: () => request('/admin/alerts/all'),
  deleteAlert: (id: number) => request(`/admin/alerts/${id}`, { method: 'DELETE' }),
};
