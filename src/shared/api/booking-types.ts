export interface ApiAvailableSlot {
  time: string
  available: boolean
}

export interface ApiAvailableSlotsResponse {
  date: string
  master_id: string
  slots: ApiAvailableSlot[]
}

export interface ApiBookingCreate {
  master_id: string
  service_id: string
  date: string
  time: string
  client_name: string
  client_phone: string
  user_id?: string
}

export interface ApiBooking {
  id: string
  master_id: string
  service_id: string
  date: string
  time: string
  client_name: string
  client_phone: string
  status: string
  created_at: string
}
