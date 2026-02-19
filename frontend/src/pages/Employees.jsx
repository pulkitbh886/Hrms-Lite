import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { useToast } from '../components/ui/toast-context.js'
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from '../services/employees'

const todayISO = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
  date_of_joining: todayISO(),
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

function IconEye(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

const inputBase =
  'mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70'

function inputClass(hasError) {
  return `${inputBase} ${hasError ? 'border-rose-300' : 'border-slate-200'}`
}

function EmployeesTableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200">
      <div className="grid grid-cols-6 gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-3 w-full" />
        ))}
      </div>
      <div className="space-y-4 px-4 py-4">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={`row-${row}`} className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, col) => (
              <Skeleton key={`cell-${row}-${col}`} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Employees() {
  const { showToast } = useToast()

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [detailsEmployee, setDetailsEmployee] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const employeeIdInputRef = useRef(null)
  const fullNameInputRef = useRef(null)

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return employees
    return employees.filter((employee) => {
      const composite = `${employee.full_name} ${employee.email} ${employee.employee_id}`.toLowerCase()
      return composite.includes(query)
    })
  }, [employees, searchQuery])

  const canSubmit = useMemo(() => {
    const baseValid = form.full_name.trim() && form.email.trim() && form.department.trim() && form.date_of_joining
    if (editingId) return Boolean(baseValid)
    return Boolean(baseValid && form.employee_id.trim())
  }, [editingId, form])

  const fieldErrors = useMemo(() => {
    if (!submitAttempted) return {}
    return {
      employee_id: !editingId && !form.employee_id.trim() ? 'Employee ID is required.' : '',
      full_name: !form.full_name.trim() ? 'Full name is required.' : '',
      email: !form.email.trim() ? 'Email is required.' : '',
      department: !form.department.trim() ? 'Department is required.' : '',
      date_of_joining: !form.date_of_joining ? 'Date of joining is required.' : '',
    }
  }, [editingId, form, submitAttempted])

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listEmployees()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to load employees'
      setError(message)
      showToast({
        type: 'error',
        title: 'Unable to load employees',
        message,
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  function resetForm() {
    setForm(initialForm)
    setEditingId(null)
    setSubmitAttempted(false)
    setFormError('')
    window.setTimeout(() => employeeIdInputRef.current?.focus(), 0)
  }

  function onEdit(employee) {
    setEditingId(employee.id)
    setForm({
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department,
      date_of_joining: employee.date_of_joining,
    })
    setSubmitAttempted(false)
    setFormError('')
    window.setTimeout(() => fullNameInputRef.current?.focus(), 0)
  }

  async function onSubmit(event) {
    event.preventDefault()
    setSubmitAttempted(true)
    setFormError('')

    if (
      (!editingId && !form.employee_id.trim()) ||
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.department.trim() ||
      !form.date_of_joining
    ) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateEmployee(editingId, {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          date_of_joining: form.date_of_joining,
        })
        showToast({
          type: 'success',
          title: 'Employee updated',
          message: `${form.full_name.trim()} was updated successfully.`,
        })
      } else {
        await createEmployee({
          employee_id: form.employee_id.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          date_of_joining: form.date_of_joining,
        })
        showToast({
          type: 'success',
          title: 'Employee created',
          message: `${form.full_name.trim()} has been added.`,
        })
      }
      resetForm()
      await loadEmployees()
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Unable to save employee'
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

  function onDeleteRequest(employee) {
    setConfirmTarget(employee)
  }

  async function onConfirmDelete() {
    if (!confirmTarget) return
    setDeleting(true)
    try {
      await deleteEmployee(confirmTarget.id)
      showToast({
        type: 'success',
        title: 'Employee deleted',
        message: `${confirmTarget.full_name} was removed.`,
      })
      if (editingId === confirmTarget.id) resetForm()
      setConfirmTarget(null)
      await loadEmployees()
    } catch (err) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to delete employee'
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Employee Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage employee records with reliable validation and safe actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{employees.length} total</Badge>
          <Button onClick={loadEmployees} size="sm" variant="secondary">
            <IconRefresh className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingId ? 'Edit Employee' : 'Add Employee'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editingId
                    ? 'Update details. Employee ID is locked.'
                    : 'Create a new employee. Employee ID must be unique.'}
                </p>
              </div>
              <Badge variant={editingId ? 'info' : 'neutral'}>{editingId ? 'Editing' : 'New'}</Badge>
            </div>
          </div>

          <form className="p-5" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  Employee ID{editingId ? null : <span className="text-rose-600">*</span>}
                </label>
                <input
                  ref={employeeIdInputRef}
                  autoFocus={!editingId}
                  className={inputClass(Boolean(fieldErrors.employee_id))}
                  disabled={saving || Boolean(editingId)}
                  onChange={(event) => setForm({ ...form, employee_id: event.target.value })}
                  placeholder="EMP-001"
                  value={form.employee_id}
                />
                {fieldErrors.employee_id ? (
                  <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.employee_id}</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Example: EMP-001, EMP-100</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  Full Name<span className="text-rose-600">*</span>
                </label>
                <input
                  ref={fullNameInputRef}
                  autoFocus={Boolean(editingId)}
                  className={inputClass(Boolean(fieldErrors.full_name))}
                  disabled={saving}
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                  placeholder="Jane Doe"
                  required
                  value={form.full_name}
                />
                {fieldErrors.full_name ? (
                  <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.full_name}</p>
                ) : null}
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  Email<span className="text-rose-600">*</span>
                </label>
                <input
                  className={inputClass(Boolean(fieldErrors.email))}
                  disabled={saving}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="jane@company.com"
                  required
                  type="email"
                  value={form.email}
                />
                {fieldErrors.email ? <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.email}</p> : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Department<span className="text-rose-600">*</span>
                  </label>
                  <input
                    className={inputClass(Boolean(fieldErrors.department))}
                    disabled={saving}
                    onChange={(event) => setForm({ ...form, department: event.target.value })}
                    placeholder="Engineering"
                    required
                    value={form.department}
                  />
                  {fieldErrors.department ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.department}</p>
                  ) : null}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Date of Joining<span className="text-rose-600">*</span>
                  </label>
                  <input
                    className={inputClass(Boolean(fieldErrors.date_of_joining))}
                    disabled={saving}
                    onChange={(event) => setForm({ ...form, date_of_joining: event.target.value })}
                    required
                    type="date"
                    value={form.date_of_joining}
                  />
                  {fieldErrors.date_of_joining ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.date_of_joining}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {formError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {formError}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button disabled={saving || !canSubmit} type="submit" variant="primary">
                {saving ? 'Saving...' : editingId ? 'Update Employee' : 'Create Employee'}
              </Button>
              {editingId ? (
                <Button disabled={saving} onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              ) : null}
              <div className="text-xs text-slate-500 sm:ml-auto">Changes save directly to your database.</div>
            </div>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Employee Directory</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredEmployees.length} shown of {employees.length} total
                </p>
              </div>
              <div className="w-full sm:max-w-xs">
                <label className="sr-only" htmlFor="employee-search">
                  Search employees
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  id="employee-search"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name, email, ID"
                  value={searchQuery}
                />
              </div>
            </div>
          </div>

          <div className="p-5">
            {error ? (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {loading ? (
              <EmployeesTableSkeleton />
            ) : filteredEmployees.length === 0 ? (
              <EmptyState
                action={
                  searchQuery ? (
                    <Button onClick={() => setSearchQuery('')} size="sm" variant="secondary">
                      Clear search
                    </Button>
                  ) : null
                }
                description={
                  searchQuery
                    ? `No employee matched "${searchQuery}".`
                    : 'Create your first employee using the form on the left.'
                }
                title={searchQuery ? 'No matching employees' : 'No employees found'}
              />
            ) : (
              <div className="max-h-[560px] overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Employee ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Department
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((employee, index) => {
                      const isEditing = editingId === employee.id
                      const baseBg = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'

                      return (
                        <tr
                          key={employee.id}
                          className={`${isEditing ? 'bg-indigo-50' : baseBg} transition-colors hover:bg-slate-100`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                            {employee.employee_id}
                          </td>
                          <td className="px-4 py-3 text-slate-900">{employee.full_name}</td>
                          <td className="px-4 py-3 text-slate-700">{employee.email}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{employee.department}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{employee.date_of_joining}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                aria-label={`View ${employee.full_name}`}
                                onClick={() => setDetailsEmployee(employee)}
                                size="icon"
                                title="View details"
                                variant="secondary"
                              >
                                <IconEye className="h-4 w-4" />
                              </Button>
                              <Button
                                aria-label={`Edit ${employee.full_name}`}
                                onClick={() => onEdit(employee)}
                                size="icon"
                                title="Edit"
                                variant="secondary"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                aria-label={`Delete ${employee.full_name}`}
                                onClick={() => onDeleteRequest(employee)}
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
        </Card>
      </div>

      <Modal
        description="Read-only employee profile snapshot."
        onClose={() => setDetailsEmployee(null)}
        open={Boolean(detailsEmployee)}
        size="md"
        title="Employee Details"
      >
        {detailsEmployee ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Employee ID</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{detailsEmployee.employee_id}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Full Name</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{detailsEmployee.full_name}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Email</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{detailsEmployee.email}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Department</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{detailsEmployee.department}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">Date of Joining</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{detailsEmployee.date_of_joining}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button onClick={() => setDetailsEmployee(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Delete employee"
        loading={deleting}
        message={
          confirmTarget
            ? `Delete ${confirmTarget.full_name} (${confirmTarget.employee_id})? This action cannot be undone.`
            : 'This action cannot be undone.'
        }
        onCancel={() => setConfirmTarget(null)}
        onConfirm={onConfirmDelete}
        open={Boolean(confirmTarget)}
        title="Delete Employee"
      />
    </div>
  )
}
