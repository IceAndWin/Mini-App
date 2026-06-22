export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  categoryId: string
}

export interface Master {
  id: string
  name: string
  avatar: string
  specialties: string[]
  rating: number
}

export interface Booking {
  id: string
  serviceId: string
  masterId: string
  date: string
  time: string
  clientName: string
  clientPhone: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface TimeSlot {
  time: string
  available: boolean
}
