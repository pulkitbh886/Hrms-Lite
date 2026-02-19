import api from './api'

export async function listAttendance({ employeeId, date }) {
  const params = {}
  if (employeeId) params.employee_id = employeeId
  if (date) params.date = date
  const { data } = await api.get('/attendance', { params })
  return data
}

export async function createAttendance(payload) {
  const response = await api.post('/attendance', payload)
  return { data: response.data, status: response.status }
}

export async function updateAttendance(id, payload) {
  const { data } = await api.put(`/attendance/${id}`, payload)
  return data
}

export async function deleteAttendance(id) {
  await api.delete(`/attendance/${id}`)
}

