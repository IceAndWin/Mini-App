import { create } from 'zustand'
import type { ApiMasterListItem, ApiService } from '@/shared/api/types'

type BookingStep = 1 | 2 | 3 | 4

interface BookingState {
  currentStep: BookingStep
  selectedService: ApiService | null
  selectedMaster: ApiMasterListItem | null
  selectedDate: string | null
  selectedTime: string | null
  clientName: string
  clientPhone: string
  promoCode: string
  discountPercent: number
  isSubmitting: boolean
  isSuccess: boolean

  setService: (service: ApiService) => void
  setMaster: (master: ApiMasterListItem) => void
  setDate: (date: string) => void
  setTime: (time: string | null) => void
  setClientName: (name: string) => void
  setClientPhone: (phone: string) => void
  setPromoCode: (code: string) => void
  setDiscountPercent: (pct: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: BookingStep) => void
  setSubmitting: (v: boolean) => void
  setSuccess: (v: boolean) => void
  reset: () => void
}

const initialState = {
  currentStep: 1 as BookingStep,
  selectedService: null,
  selectedMaster: null,
  selectedDate: null,
  selectedTime: null,
  clientName: '',
  clientPhone: '',
  promoCode: '',
  discountPercent: 0,
  isSubmitting: false,
  isSuccess: false,
}

export const useBookingStore = create<BookingState>()((set) => ({
  ...initialState,

  setService: (service) => { set({ selectedService: service }) },
  setMaster: (master) => { set({ selectedMaster: master }) },
  setDate: (date) => { set({ selectedDate: date }) },
  setTime: (time) => { set({ selectedTime: time }) },
  setClientName: (clientName) => { set({ clientName }) },
  setClientPhone: (clientPhone) => { set({ clientPhone }) },
  setPromoCode: (promoCode) => { set({ promoCode }) },
  setDiscountPercent: (discountPercent) => { set({ discountPercent }) },

  nextStep: () => {
    set((state) => ({ currentStep: Math.min(4, state.currentStep + 1) as BookingStep }))
  },

  prevStep: () => {
    set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) as BookingStep }))
  },

  goToStep: (step) => { set({ currentStep: step }) },

  setSubmitting: (isSubmitting) => { set({ isSubmitting }) },
  setSuccess: (isSuccess) => { set({ isSuccess }) },

  reset: () => { set(initialState) },
}))
