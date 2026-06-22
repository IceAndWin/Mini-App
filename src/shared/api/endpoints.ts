import { apiClient } from './client'
import type {
  ApiAuthResponse,
  ApiBookingCancel,
  ApiBookingFull,
  ApiMasterDetail,
  ApiMasterListItem,
  ApiService,
  ApiUser,
} from './types'
import type { ApiAvailableSlotsResponse, ApiBookingCreate, ApiBooking } from './booking-types'

export async function fetchServices(params?: { category?: string; search?: string }): Promise<ApiService[]> {
  const { data } = await apiClient.get<ApiService[]>('/api/services', { params })
  return data
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await apiClient.get<string[]>('/api/services/categories')
  return data
}

export async function fetchMasters(): Promise<ApiMasterListItem[]> {
  const { data } = await apiClient.get<ApiMasterListItem[]>('/api/masters')
  return data
}

export async function fetchMasterById(id: string): Promise<ApiMasterDetail> {
  const { data } = await apiClient.get<ApiMasterDetail>(`/api/masters/${id}`)
  return data
}

export async function authTelegram(initData: string, user?: Record<string, unknown>): Promise<ApiAuthResponse> {
  const { data } = await apiClient.post<ApiAuthResponse>('/auth/telegram', { init_data: initData, user })
  return data
}

export async function fetchAvailableSlots(
  masterId: string,
  date: string,
  serviceId?: string,
): Promise<ApiAvailableSlotsResponse> {
  const params: Record<string, string> = {}
  params.master_id = masterId
  params.date = date
  if (serviceId) params.service_id = serviceId
  const { data } = await apiClient.get<ApiAvailableSlotsResponse>('/api/bookings/available-slots', { params })
  return data
}

export async function createBooking(body: ApiBookingCreate): Promise<ApiBooking> {
  const response: { data: ApiBooking } = await apiClient.post('/api/bookings', body)
  return response.data
}

export async function fetchMyBookings(): Promise<ApiBookingFull[]> {
  const { data } = await apiClient.get<ApiBookingFull[]>('/api/bookings/my')
  return data
}

export async function cancelBooking(bookingId: string): Promise<ApiBookingCancel> {
  const { data } = await apiClient.put<ApiBookingCancel>(`/api/bookings/${bookingId}/cancel`)
  return data
}

export async function rescheduleBooking(bookingId: string, body: { date: string; time: string }): Promise<ApiBookingFull> {
  const { data } = await apiClient.put<ApiBookingFull>(`/api/bookings/${bookingId}/reschedule`, body)
  return data
}

export async function fetchMe(): Promise<ApiUser> {
  const { data } = await apiClient.get<ApiUser>('/api/users/me')
  return data
}
