function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200/80', className)} />
}

