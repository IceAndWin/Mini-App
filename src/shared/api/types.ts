export interface ApiService {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string | null
  is_active: boolean
}

export interface ApiReview {
  id: string
  rating: number
  text: string | null
  client_name: string
  created_at: string
}

export interface ApiMasterListItem {
  id: string
  name: string
  bio: string | null
  avatar_url: string | null
  rating: number
  is_active: boolean
  reviews_count: number
}

export interface ApiMasterDetail extends ApiMasterListItem {
  reviews: ApiReview[]
}

export interface ApiCategory {
  id: string
  name: string
}

export interface ApiAuthResponse {
  token: string
  user_id: string
  telegram_id: number
}

export interface ApiBooking {
  id: string
  master_id: string
  service_id: string
  date: string
  time: string
  client_name: string
  client_phone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  user_id: string | null
}

export interface ApiUser {
  id: string
  telegram_id: number
  first_name: string
  last_name: string | null
  username: string | null
  phone: string | null
  bonus_points: number
  promo_code: string | null
}

export interface ApiBookingFull {
  id: string
  master_id: string
  service_id: string
  date: string
  time: string
  client_name: string
  client_phone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  user_id: string | null
  created_at: string
  master: ApiMasterListItem
  service: ApiService
}

export interface ApiBookingCancel {
  id: string
  status: string
  message: string
}

export interface ApiBookingReschedule {
  date: string
  time: string
}

export interface ApiMyBookingsResponse {
  active: ApiBookingFull[]
  history: ApiBookingFull[]
}
