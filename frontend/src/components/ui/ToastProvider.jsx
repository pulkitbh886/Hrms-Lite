import { useCallback, useMemo, useState } from 'react'
import Toast from './Toast.jsx'
import { ToastContext } from './toast-context.js'

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type = 'info', title, message, duration = 3500 }) => {
      const id = createToastId()
      setToasts((current) => [...current, { id, type, title, message }])
      window.setTimeout(() => dismissToast(id), duration)
      return id
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(420px,calc(100%-2rem))] flex-col gap-2">
        {toasts.map((item) => (
          <Toast
            key={item.id}
            message={item.message}
            onClose={() => dismissToast(item.id)}
            title={item.title}
            type={item.type}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
