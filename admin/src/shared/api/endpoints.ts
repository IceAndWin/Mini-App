import { apiClient } from './client'
import type {
  AdminBooking,
  AdminMaster,
  AdminService,
  StatsBookings,
  StatsClients,
  StatsMasterLoad,
  StatsTopServices,
  StatsTotal,
} from './types'

export function fetchAdminServices(): Promise<AdminService[]> {
  return apiClient.get('/api/admin/services').then((r) => r.data)
}

export function createAdminService(body: Partial<AdminService>): Promise<AdminService> {
  return apiClient.post('/api/admin/services', body).then((r) => r.data)
}

export function updateAdminService(id: string, body: Partial<AdminService>): Promise<AdminService> {
  return apiClient.put(`/api/admin/services/${id}`, body).then((r) => r.data)
}

export function deleteAdminService(id: string): Promise<void> {
  return apiClient.delete(`/api/admin/services/${id}`)
}

export function fetchAdminMasters(): Promise<AdminMaster[]> {
  return apiClient.get('/api/admin/masters').then((r) => r.data)
}

export function createAdminMaster(body: Partial<AdminMaster>): Promise<AdminMaster> {
  return apiClient.post('/api/admin/masters', body).then((r) => r.data)
}

export function updateAdminMaster(id: string, body: Partial<AdminMaster>): Promise<AdminMaster> {
  return apiClient.put(`/api/admin/masters/${id}`, body).then((r) => r.data)
}

export function deleteAdminMaster(id: string): Promise<void> {
  return apiClient.delete(`/api/admin/masters/${id}`)
}

export function uploadMasterPhoto(id: string, file: File): Promise<AdminMaster> {
  const form = new FormData()
  form.append('file', file)
  return apiClient.post(`/api/admin/masters/${id}/photo`, form).then((r) => r.data)
}

export function fetchAllBookings(params?: Record<string, string>): Promise<AdminBooking[]> {
  return apiClient.get('/api/admin/bookings', { params }).then((r) => r.data)
}

export function fetchStatsBookings(period = 'week'): Promise<StatsBookings> {
  return apiClient.get('/api/admin/stats/bookings', { params: { period } }).then((r) => r.data)
}

export function fetchStatsTopServices(): Promise<StatsTopServices> {
  return apiClient.get('/api/admin/stats/top-services').then((r) => r.data)
}

export function fetchStatsMasterLoad(): Promise<StatsMasterLoad> {
  return apiClient.get('/api/admin/stats/master-load').then((r) => r.data)
}

export function fetchStatsClients(): Promise<StatsClients> {
  return apiClient.get('/api/admin/stats/clients').then((r) => r.data)
}

export function fetchStatsTotal(): Promise<StatsTotal> {
  return apiClient.get('/api/admin/stats/total').then((r) => r.data)
}
