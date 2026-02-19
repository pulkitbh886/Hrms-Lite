import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { useToast } from '../components/ui/toast-context.js'
import { createAttendance, deleteAttendance, listAttendance, updateAttendance } from '../services/attendance'
import { listEmployees } from '../services/employees'

const todayISO = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  employee_id: '',
  date: todayISO(),
  status: 'Present',
}

function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v8h-8" />
    </svg>
  )
}

function IconEdit(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

const inputBase =
  'mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70'

function inputClass(hasError) {
  return `${inputBase} ${hasError ? 'border-rose-300' : 'border-slate-200'}`
}

function AttendanceTableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="grid grid-cols-4 gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-3 w-full" />
        ))}
      </div>
      <div className="space-y-4 px-4 py-4">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={`row-${row}`} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, col) => (
              <Skeleton key={`cell-${row}-${col}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function AttendanceFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>
  )
}

export default function Attendance() {
  const { showToast } = useToast()

  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(true)
  const [employeesError, setEmployeesError] = useState('')

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState(initialForm)
  const [filterDate, setFilterDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const employeeSelectRef = useRef(null)
  const dateInputRef = useRef(null)

  const selectedEmployee = useMemo(() => {
    const id = Number(form.employee_id)
    if (!id) return null
    return employees.find((employee) => employee.id === id) || null
  }, [employees, form.employee_id])

  const visibleRecords = useMemo(() => {
    if (!filterDate) return records
    return records.filter((record) => record.date === filterDate)
  }, [filterDate, records])

  const presentCount = useMemo(() => records.filter((record) => record.status === 'Present').length, [records])
  const absentCount = useMemo(() => records.filter((record) => record.status === 'Absent').length, [records])

  const canSubmit = useMemo(() => Boolean(form.employee_id && form.date && form.status), [form])

  const fieldErrors = useMemo(() => {
    if (!submitAttempted) return {}
    return {
      employee_id: !form.employee_id ? 'Employee is required.' : '',
      date: !form.date ? 'Date is required.' : '',
    }
  }, [form, submitAttempted])

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true)
    setEmployeesError('')
    try {
      const data = await listEmployees()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to load employees'
      setEmployeesError(message)
      showToast({
        type: 'error',
        title: 'Unable to load employees',
        message,
      })
    } finally {
      setEmployeesLoading(false)
    }
  }, [showToast])

  const loadAttendance = useCallback(async () => {
    if (!form.employee_id) {
      setRecords([])
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await listAttendance({
        employeeId: Number(form.employee_id),
      })
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to load attendance'
      setError(message)
      showToast({
        type: 'error',
        title: 'Unable to load attendance',
        message,
      })
    } finally {
      setLoading(false)
    }
  }, [form.employee_id, showToast])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  function resetForm() {
    setForm((prev) => ({
      ...initialForm,
      employee_id: prev.employee_id,
      date: todayISO(),
    }))
    setEditingId(null)
    setSubmitAttempted(false)
    setFormError('')
    window.setTimeout(() => employeeSelectRef.current?.focus(), 0)
  }

  function onEdit(record) {
    setEditingId(record.id)
    setForm({
      employee_id: String(record.employee_id),
      date: record.date,
      status: record.status,
    })
    setSubmitAttempted(false)
    setFormError('')
    window.setTimeout(() => dateInputRef.current?.focus(), 0)
  }

  async function onSubmit(event) {
    event.preventDefault()
    setSubmitAttempted(true)
    setFormError('')

    if (!form.employee_id || !form.date) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateAttendance(editingId, { date: form.date, status: form.status })
        showToast({
          type: 'success',
          title: 'Attendance updated',
          message: `${selectedEmployee?.full_name || 'Employee'} attendance was updated.`,
        })
      } else {
        const result = await createAttendance({
          employee_id: Number(form.employee_id),
          date: form.date,
          status: form.status,
        })
        const isUpdate = result?.status === 200
        showToast({
          type: 'success',
          title: isUpdate ? 'Attendance updated' : 'Attendance marked',
          message: isUpdate
            ? `${selectedEmployee?.full_name || 'Employee'} status updated to ${form.status.toLowerCase()}.`
            : `${selectedEmployee?.full_name || 'Employee'} marked as ${form.status.toLowerCase()}.`,
        })
      }

      resetForm()
      await loadAttendance()
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Unable to save attendance'
      setFormError(message)
      showToast({
        type: 'error',
        title: 'Save failed',
        message,
      })
    } finally {
      setSaving(false)
    }
  }

  function onDeleteRequest(record) {
    setConfirmTarget(record)
  }

  async function onConfirmDelete() {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      await deleteAttendance(confirmTarget.id)
      showToast({
        type: 'success',
        title: 'Attendance deleted',
        message: `${selectedEmployee?.full_name || 'Employee'} attendance entry removed.`,
      })
      if (editingId === confirmTarget.id) resetForm()
      setConfirmTarget(null)
      await loadAttendance()
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to delete attendance'
      setError(message)
      showToast({
        type: 'error',
        title: 'Delete failed',
        message,
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance Management</h1>
          <p className="mt-1 text-sm text-slate-500">Track daily attendance, edit entries, and review present-day totals.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedEmployee ? (
            <Badge variant="neutral">
              {selectedEmployee.full_name} ({selectedEmployee.employee_id})
            </Badge>
          ) : null}
          <Button
            disabled={!form.employee_id}
            onClick={loadAttendance}
            title={!form.employee_id ? 'Select an employee to refresh attendance' : 'Refresh attendance'}
            variant="secondary"
          >
            <IconRefresh className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <Card as="section">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingId ? 'Edit Attendance' : 'Mark Attendance'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editingId
                    ? 'Update the selected record. Employee selection is locked.'
                    : 'Choose an employee, date, and attendance status.'}
                </p>
              </div>
              <Badge variant={editingId ? 'info' : 'neutral'}>{editingId ? 'Editing' : 'New'}</Badge>
            </div>
          </div>

          <div className="p-5">
            {employeesLoading ? (
              <AttendanceFormSkeleton />
            ) : employeesError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {employeesError}
              </div>
            ) : employees.length === 0 ? (
              <EmptyState title="No employees" description="Add employees before marking attendance." />
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Employee<span className="text-rose-600">*</span>
                  </label>
                  <select
                    ref={employeeSelectRef}
                    className={inputClass(Boolean(fieldErrors.employee_id))}
                    disabled={saving || Boolean(editingId)}
                    onChange={(event) => setForm({ ...form, employee_id: event.target.value })}
                    required
                    value={form.employee_id}
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name} ({employee.employee_id})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.employee_id ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.employee_id}</p>
                  ) : selectedEmployee ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Selected: {selectedEmployee.full_name} ({selectedEmployee.employee_id})
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Date<span className="text-rose-600">*</span>
                  </label>
                  <input
                    ref={dateInputRef}
                    className={inputClass(Boolean(fieldErrors.date))}
                    disabled={saving}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    required
                    type="date"
                    value={form.date}
                  />
                  {fieldErrors.date ? <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.date}</p> : null}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Status</label>
                  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        aria-pressed={form.status === 'Present'}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                          form.status === 'Present'
                            ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                            : 'text-slate-600 hover:bg-white/70'
                        }`}
                        disabled={saving}
                        onClick={() => setForm({ ...form, status: 'Present' })}
                        type="button"
                      >
                        Present
                      </button>
                      <button
                        aria-pressed={form.status === 'Absent'}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                          form.status === 'Absent'
                            ? 'bg-white text-rose-700 shadow-sm ring-1 ring-rose-200'
                            : 'text-slate-600 hover:bg-white/70'
                        }`}
                        disabled={saving}
                        onClick={() => setForm({ ...form, status: 'Absent' })}
                        type="button"
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </div>

                {formError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {formError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button disabled={saving || !canSubmit} type="submit" variant="primary">
                    {saving ? 'Saving...' : editingId ? 'Update Attendance' : 'Mark Attendance'}
                  </Button>
                  {editingId ? (
                    <Button disabled={saving} onClick={resetForm} variant="secondary">
                      Cancel
                    </Button>
                  ) : null}
                  <div className="text-xs text-slate-500 sm:ml-auto">Changes save directly to your database.</div>
                </div>
              </form>
            )}
          </div>
        </Card>

        <Card as="section" className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Attendance Records</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedEmployee
                    ? `${selectedEmployee.full_name} - ${selectedEmployee.employee_id}`
                    : 'Choose an employee to view attendance history.'}
                </p>
              </div>
              {selectedEmployee ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    {records.length} record{records.length === 1 ? '' : 's'}
                  </Badge>
                  <Badge variant="success">{presentCount} present days</Badge>
                  <Badge variant="danger">{absentCount} absent days</Badge>
                </div>
              ) : null}
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-xs">
                <label className="text-xs font-semibold text-slate-600">Filter by date</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  onChange={(event) => setFilterDate(event.target.value)}
                  type="date"
                  value={filterDate}
                />
              </div>
              {filterDate ? (
                <Button onClick={() => setFilterDate('')} size="sm" variant="secondary">
                  Clear filter
                </Button>
              ) : null}
            </div>

            <div className="mt-4">
              {!form.employee_id ? (
                <EmptyState title="Select an employee" description="Choose an employee to view attendance records." />
              ) : loading ? (
                <AttendanceTableSkeleton />
              ) : error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : visibleRecords.length === 0 ? (
                <EmptyState
                  description={
                    filterDate ? `No attendance records for ${filterDate}.` : 'Mark attendance to populate this list.'
                  }
                  title="No records found"
                />
              ) : (
                <div className="max-h-[560px] overflow-auto rounded-xl border border-slate-200">
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
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleRecords.map((record, index) => {
                        const isEditing = editingId === record.id
                        const baseBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'

                        return (
                          <tr
                            key={record.id}
                            className={`${isEditing ? 'bg-indigo-50' : baseBg} transition-colors hover:bg-slate-100`}
                          >
                            <td className="px-4 py-3 text-slate-900">
                              {selectedEmployee ? selectedEmployee.full_name : `Employee #${record.employee_id}`}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-700">{record.date}</td>
                            <td className="px-4 py-3">
                              <Badge variant={record.status === 'Present' ? 'success' : 'danger'}>
                                {record.status}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  aria-label="Edit attendance"
                                  onClick={() => onEdit(record)}
                                  size="icon"
                                  title="Edit"
                                  variant="secondary"
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  aria-label="Delete attendance"
                                  onClick={() => onDeleteRequest(record)}
                                  size="icon"
                                  title="Delete"
                                  variant="danger"
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Delete attendance"
        loading={deleting}
        message={
          confirmTarget
            ? `Delete ${confirmTarget.status.toLowerCase()} record for ${confirmTarget.date}? This action cannot be undone.`
            : 'This action cannot be undone.'
        }
        onCancel={() => setConfirmTarget(null)}
        onConfirm={onConfirmDelete}
        open={Boolean(confirmTarget)}
        title="Delete Attendance"
      />
    </div>
  )
}
