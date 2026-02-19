# HRMS Lite 

HRMS Lite is a lightweight Human Resource Management System designed for a single-admin workflow.  
The application focuses on essential HR operations including employee record management and daily attendance tracking through a clean, professional web interface.

The system is intentionally minimal, prioritizing stability, clarity, and usability over excessive features.

## Project Overview

- Scope-safe architecture: no authentication, single admin workflow, unchanged API contracts
- Core modules: Dashboard, Employee Management, Attendance Management
- Focus: production-like UI quality, reliable states, and clean component structure

## Application Workflow (Single Admin, No Auth)

1. Open the app and review `Dashboard` metrics
2. Create or edit employee records in `Employees`
3. Mark and manage attendance in `Attendance`
4. Filter data, review summaries, and perform safe delete actions with confirmations

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- Tailwind CSS

### Backend
- FastAPI
- SQLAlchemy
- Pydantic

### Database
- SQLite (default)
- PostgreSQL-ready via `DATABASE_URL`

## Key Features

### Dashboard
- Redesigned summary cards with clearer hierarchy
- Attendance rate and coverage indicators
- Recent activity table with status badges and zebra rows

### Employee Management
- Add, list, edit, delete employees
- Search/filter by name, email, or employee ID
- Employee details modal (read-only)
- Inline validation feedback and disabled submit states
- Toast feedback and confirmation dialog for delete actions

### Attendance Management
- Mark, list, edit, delete attendance records
- Date filter for attendance records
- Per-employee present/absent day summaries
- Improved status selection UI (present/absent segmented control)
- Toast feedback and confirmation dialog for delete actions

## UX and Validation Improvements

- Skeleton loaders for forms and tables
- Improved empty states with clear guidance
- Better error alert surfaces
- Disabled controls during API calls to prevent duplicate submissions
- Inline field-level validation messages

## Reusable UI Components Added

- `frontend/src/components/ui/ToastProvider.jsx`
- `frontend/src/components/ui/Toast.jsx`
- `frontend/src/components/ui/toast-context.js`
- `frontend/src/components/ui/Modal.jsx`
- `frontend/src/components/ui/ConfirmDialog.jsx`
- `frontend/src/components/ui/Skeleton.jsx`

## Deployment Architecture

- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Frontend runtime API base URL via `VITE_API_URL`
- Backend database via `DATABASE_URL`

## Local Setup

### 1) Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend default URL: `http://localhost:8000`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Environment Variables

Backend (`backend/.env.example`):

```env
DATABASE_URL=sqlite:///./hrms.db
```

Frontend (`frontend/.env.example`):

```env
VITE_API_URL=http://localhost:8000
```

## API Endpoints (Unchanged)

### Employees
- `GET /employees`
- `POST /employees`
- `GET /employees/{employee_id}`
- `PUT /employees/{employee_id}`
- `DELETE /employees/{employee_id}`

### Attendance
- `GET /attendance?employee_id=&date=`
- `GET /attendance/{employee_id}`
- `POST /attendance`
- `PUT /attendance/{attendance_id}`
- `DELETE /attendance/{attendance_id}`

### Dashboard
- `GET /dashboard/summary`

## Assumptions and Limitations

- Single admin workflow only
- No authentication by assignment constraint
- No payroll, leave, or multi-role modules
- SQLite is used by default for quick setup; PostgreSQL is recommended for production scale

## Future Improvements (Optional)

- CSV export for employee and attendance reports
- Pagination/server-side filtering for larger datasets
- Department-level analytics and trend charts
- Audit logs for edit/delete operations
