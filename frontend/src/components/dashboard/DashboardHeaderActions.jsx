import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'

function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v8h-8" />
    </svg>
  )
}

export default function DashboardHeaderActions({ onRefresh }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button as={Link} to="/employees" variant="primary">
        Add Employee
      </Button>
      <Button as={Link} to="/attendance" variant="secondary">
        Mark Attendance
      </Button>
      <Button onClick={onRefresh} variant="ghost">
        <IconRefresh className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  )
}

