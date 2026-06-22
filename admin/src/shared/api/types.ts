export interface AdminService {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string | null
  is_active: boolean
}

export interface AdminMaster {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  rating: number
  is_active: boolean
  reviews_count: number
}

export interface AdminBooking {
  id: string
  master_id: string
  service_id: string
  date: string
  time: string
  client_name: string
  client_phone: string
  status: string
  user_id: string | null
  created_at: string
  master: AdminMaster
  service: AdminService
}

export interface StatsBookings {
  labels: string[]
  values: number[]
}

export interface StatsTopServices {
  labels: string[]
  values: number[]
}

export interface StatsMasterLoad {
  labels: string[]
  values: number[]
}

export interface StatsClients {
  new_clients: number
  returning_clients: number
}

export interface StatsTotal {
  total_bookings: number
  total_masters: number
  total_services: number
  total_users: number
}
