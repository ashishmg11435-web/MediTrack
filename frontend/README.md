# MediTrack Frontend

A lightweight React frontend for a FastAPI healthcare portfolio project.

## Run

```bash
npm install
npm run dev
```

The frontend expects FastAPI at `http://127.0.0.1:8000`.

## Expected API contract

### Authentication
- `POST /auth/register`
  JSON: `{ "name": "...", "email": "...", "password": "..." }`
- `POST /auth/login`
  Form fields: `username`, `password`
  Response: `{ "access_token": "...", "token_type": "bearer" }`

### Medical records
- `GET /records`
- `POST /records`
- `DELETE /records/{id}`

Record fields:
`id`, `diagnosis`, `doctor_name`, `visit_date`, `notes`

### Medicines
- `GET /medicines`
- `POST /medicines`
- `DELETE /medicines/{id}`

Medicine fields:
`id`, `name`, `dosage`, `frequency`, `start_date`, `end_date`

### Appointments
- `GET /appointments`
- `POST /appointments`
- `DELETE /appointments/{id}`

Appointment fields:
`id`, `doctor_name`, `appointment_date`, `reason`

Protected endpoints receive:

`Authorization: Bearer <access_token>`

## FastAPI CORS

Your backend must allow the Vite frontend origin, normally `http://localhost:5173`.
