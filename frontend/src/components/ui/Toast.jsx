import Button from './Button.jsx'

const variants = {
  info: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
}

export default function Toast({ type = 'info', title, message, onClose }) {
  return (
    <article
      className={`pointer-events-auto w-full rounded-xl border px-4 py-3 shadow-soft ${variants[type] || variants.info}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{title}</div>
          {message ? <div className="mt-1 text-sm opacity-90">{message}</div> : null}
        </div>
        <Button
          aria-label="Dismiss notification"
          className="!rounded-lg !px-2 !py-1 text-xs"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          Close
        </Button>
      </div>
    </article>
  )
}

