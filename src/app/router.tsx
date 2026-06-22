import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { LazyPage } from '@/shared/ui/LazyPage'
import type { RouteObject } from 'react-router-dom'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const MastersPage = lazy(() => import('@/pages/MastersPage'))
const BookingPage = lazy(() => import('@/pages/BookingPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <LazyPage Component={HomePage} /> },
      { path: 'services', element: <LazyPage Component={ServicesPage} /> },
      { path: 'masters', element: <LazyPage Component={MastersPage} /> },
      { path: 'booking', element: <LazyPage Component={BookingPage} /> },
      { path: 'profile', element: <LazyPage Component={ProfilePage} /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
