# Carepluse 🏥

A full-stack Healthcare Management Application built with the MERN 
Stack (MongoDB, Express.js, React.js, Node.js). Carepluse enables 
patients, doctors, and admins to manage healthcare operations 
seamlessly with role-based access control and JWT authentication.

## Features

### 🔐 Authentication & Roles
- Role-based Registration & Login — Patient, Doctor, Admin
- JWT Authentication with role-based protected routes
- Secure Admin registration with secret key validation

### 🧑‍⚕️ Patient Features
- Book appointments with preferred doctor or specialist
- Filter doctors by specialization
- View and download medical reports as PDF
- Mark favourite doctors with star/bookmark
- View appointment history

### 👨‍⚕️ Doctor Features
- View all assigned patient appointments
- Update appointment status — Pending, Confirmed, Completed, Cancelled
- Create, view and edit patient reports
- View full patient history
- Edit own profile — specialization, fee, bio, photo

### 🛡️ Admin Features
- Manage all patients, doctors and appointments
- Book appointments on behalf of patients
- Dashboard with total stats — patients, doctors, appointments
- Full control over platform data

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |

## Project Structure

```
carepluse/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios instance with JWT interceptor
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context (login state)
│   │   └── pages/          # Route pages & dashboards
│   └── package.json
└── server/                 # Express backend
    ├── config/             # MongoDB connection
    ├── controllers/        # Route handlers (MVC)
    ├── middleware/         # JWT auth & role checks
    ├── models/             # Mongoose schemas
    ├── routes/             # API route definitions
    └── server.js           # Entry point
```

## Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

## Setup Instructions

### 1. Clone and install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/carepluse
JWT_SECRET=your_super_secret_jwt_key_change_in_production
ADMIN_EMAIL=admin@carepluse.com
ADMIN_PASSWORD=admin123
```

**Client** — copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

Make sure MongoDB is running locally, or update `MONGO_URI` to your Atlas connection string.

### 4. Run the application

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@carepluse.com | admin123 |
| Patient | Register at `/register` | — |
| Doctor | Created by admin | Set by admin |

## API Endpoints (Postman-ready)

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register patient |
| POST | `/api/auth/login` | Login (all roles) |
| GET | `/api/auth/me` | Get current user (JWT required) |

### Patient (JWT + patient role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient/doctors` | List active doctors |
| POST | `/api/patient/appointments` | Book appointment |
| GET | `/api/patient/appointments` | View own appointments |
| GET | `/api/patient/records` | View medical records |

### Doctor (JWT + doctor role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctor/appointments` | View assigned appointments |
| PUT | `/api/doctor/appointments/:id/status` | Update status |
| GET | `/api/doctor/appointments/:id/patient` | Patient details |

### Admin (JWT + admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Dashboard statistics |
| POST | `/api/admin/doctors` | Add doctor |
| GET | `/api/admin/doctors` | List doctors |
| PUT | `/api/admin/doctors/:id` | Update doctor |
| DELETE | `/api/admin/doctors/:id` | Delete doctor |
| GET | `/api/admin/patients` | List patients |
| GET | `/api/admin/appointments` | List appointments |
| DELETE | `/api/admin/appointments/:id` | Delete appointment |

### Postman Usage
1. Login via `POST /api/auth/login` to get a JWT token
2. Add header: `Authorization: Bearer <your_token>`
3. Test protected routes

## Production Build

```bash
# Build frontend
cd client
npm run build

# Start server in production
cd ../server
NODE_ENV=production npm start
```

## Roles & Access

| Feature                  | Patient  | Doctor  | Admin |
|--------------------------|---------|---------|--------|
| Book Appointment         | ✅      | ❌     | ✅    |
| View Own Appointments    | ✅      | ✅     | ✅    |
| Manage Reports           | View     |  Full  | ❌    |
| Favourite Doctors        | ✅      | ❌     | ❌    |
| Manage All Users         | ❌      | ❌     | ✅    |
| Edit Doctor Profile      | ❌      | ✅     | ❌    |
```
## Author
Khushi Karanjiya
www.linkedin.com/in/khushi-karanjiya-0b4304261/

## License

ISC
