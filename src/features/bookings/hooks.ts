import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelBooking, fetchMyBookings, rescheduleBooking, fetchMe } from '@/shared/api/endpoints'

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings', 'my'],
    queryFn: fetchMyBookings,
  })
}

export function useMe() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchMe,
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['bookings', 'my'] }) },
  })
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, date, time }: { bookingId: string; date: string; time: string }) =>
      rescheduleBooking(bookingId, { date, time }),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['bookings', 'my'] }) },
  })
}
