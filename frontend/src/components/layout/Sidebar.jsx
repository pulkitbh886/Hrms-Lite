import { NavLink } from 'react-router-dom'
import logo from '../../assets/logo.svg'

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/employees', label: 'Employees' },
  { path: '/attendance', label: 'Attendance' },
]

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
          'border border-transparent',
          isActive
            ? 'bg-indigo-500/20 text-white shadow-sm'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-white/10 bg-slate-900 px-4 py-4 text-white lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:flex-none lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-1">
            <img src={logo} alt="HRMS Lite" className="h-9 w-9 rounded-xl bg-white/10 p-1.5" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">HRMS Lite</div>
              <div className="truncate text-xs text-white/60">Admin Console</div>
            </div>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-7 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => (
              <NavItem key={item.path} to={item.path}>
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>

        <div className="pt-6">
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/20 text-sm font-bold">
                A
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold">Admin</div>
                <div className="truncate text-xs text-white/60">Single Admin - No login</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
