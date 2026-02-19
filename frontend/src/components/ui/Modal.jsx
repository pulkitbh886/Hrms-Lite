import { useEffect } from 'react'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({
  open,
  title,
  description,
  onClose,
  size = 'md',
  className,
  children,
}) {
  useEffect(() => {
    if (!open) return

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[1px]"
        onClick={onClose}
        type="button"
      />

      <section
        aria-modal="true"
        role="dialog"
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
          sizes[size] || sizes.md,
          className,
        )}
      >
        {title ? (
          <header className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </header>
        ) : null}

        <div className="p-5">{children}</div>
      </section>
    </div>
  )
}

