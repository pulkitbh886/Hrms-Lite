import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardHeaderActions from '../components/dashboard/DashboardHeaderActions.jsx'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { getDashboardSummary } from '../services/dashboard'

function IconUsers(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
    </svg>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={`summary-${index}`} className="p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-28" />
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-3 w-48" />
        <Skeleton className="mt-5 h-2 w-full" />
        <Skeleton className="mt-3 h-2 w-[88%]" />
      </Card>
      <Card className="p-5">
        <Skeleton className="h-4 w-40" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`activity-${index}`} className="h-4 w-full" />
          ))}
        </div>
      </Card>
    </div>
  )
}

function ProgressBar({ value = 0, tone = 'indigo' }) {
  const clamped = Math.max(0, Math.min(100, value))
  const colors = {
    indigo: 'accent-indigo-500',
    emerald: 'accent-emerald-500',
    rose: 'accent-rose-500',
  }

  return (
    <progress className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${colors[tone] || colors.indigo}`} max="100" value={clamped} />
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const derived = useMemo(() => {
    const totalEmployees = summary?.total_employees ?? 0
    const presentToday = summary?.present_today ?? 0
    const absentToday = summary?.absent_today ?? 0
    const checkedInToday = presentToday + absentToday
    const attendanceRate = checkedInToday > 0 ? Math.round((presentToday / checkedInToday) * 100) : 0
    const coverageRate = totalEmployees > 0 ? Math.round((checkedInToday / totalEmployees) * 100) : 0

    return {
      totalEmployees,
      presentToday,
      absentToday,
      checkedInToday,
      attendanceRate,
      coverageRate,
    }
  }, [summary])

  const stats = useMemo(
    () => [
      {
        label: 'Total Employees',
        value: derived.totalEmployees,
        hint: 'Current workforce',
        badge: 'neutral',
      },
      {
        label: 'Present Today',
        value: derived.presentToday,
        hint: 'Checked in',
        badge: 'success',
      },
      {
        label: 'Absent Today',
        value: derived.absentToday,
        hint: 'Marked absent',
        badge: 'danger',
      },
      {
        label: 'Attendance Rate',
        value: `${derived.attendanceRate}%`,
        hint: 'Present among marked',
        badge: 'info',
      },
    ],
    [derived],
  )

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of workforce and attendance activity for today.</p>
        </div>
        <DashboardHeaderActions onRefresh={loadSummary} />
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <Card key={item.label} className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</div>
                  <Badge variant={item.badge}>{item.hint}</Badge>
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <IconUsers className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">Today Snapshot</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">Quick ratio view of attendance and workforce coverage.</p>

            <div className="mt-5 space-y-5">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>Attendance rate</span>
                  <span>{derived.attendanceRate}%</span>
                </div>
                <ProgressBar tone="emerald" value={derived.attendanceRate} />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>Coverage of total employees</span>
                  <span>{derived.coverageRate}%</span>
                </div>
                <ProgressBar tone="indigo" value={derived.coverageRate} />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>Absent impact</span>
                  <span>{derived.absentToday}</span>
                </div>
                <ProgressBar
                  tone="rose"
                  value={derived.totalEmployees ? Math.round((derived.absentToday / derived.totalEmployees) * 100) : 0}
                />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
                <p className="mt-1 text-xs text-slate-500">Latest attendance events recorded in the system.</p>
              </div>
            </div>

            <div className="p-5">
              {summary?.recent_attendance?.length ? (
                <div className="max-h-[520px] overflow-auto rounded-xl border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Employee
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.recent_attendance.map((row, index) => {
                        const baseBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                        return (
                          <tr key={`${row.employee_id}-${index}`} className={`${baseBg} transition hover:bg-slate-100`}>
                            <td className="px-4 py-3 font-semibold text-slate-900">{row.employee_name}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.date}</td>
                            <td className="px-4 py-3">
                              <Badge variant={row.status === 'Present' ? 'success' : 'danger'}>{row.status}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No activity yet" description="Mark attendance to start building activity logs." />
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
