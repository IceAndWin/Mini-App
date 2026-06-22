import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { apiClient } from '@/shared/api/client'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'error' | 'done'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setErrorMsg('Нет токена авторизации.')
      setStatus('error')
      return
    }

    apiClient.post('/api/admin/auth/session-login', { token })
      .then((res) => {
        sessionStorage.setItem('admin_token', res.data.token)
        setStatus('done')
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        apiClient.post('/api/admin/auth/login', { token })
          .then((res) => {
            sessionStorage.setItem('admin_token', res.data.token)
            setStatus('done')
            navigate('/dashboard', { replace: true })
          })
          .catch((err) => {
            setErrorMsg(err.response?.data?.detail ?? 'Ошибка авторизации')
            setStatus('error')
          })
      })
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-text-secondary">Авторизация...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-500">✕</div>
            <h2 className="mb-2 text-lg font-semibold">Ошибка входа</h2>
            <p className="mb-6 text-sm text-text-secondary">{errorMsg}</p>
            <p className="text-xs text-text-secondary">
              Войдите в приложение через Telegram и откройте профиль.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
