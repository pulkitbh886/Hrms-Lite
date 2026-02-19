import { createElement } from 'react'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Card({ as: Component = 'div', className, children, ...props }) {
  return createElement(
    Component,
    {
      ...props,
      className: cn(
        'rounded-2xl border border-slate-200/90 bg-white/95 shadow-soft backdrop-blur',
        className,
      ),
    },
    children,
  )
}
