# HomeEase — Two-Sided Home Services Marketplace

**Tagline:** *"Reliable Home Help, Just a Click Away."*

HomeEase is a full-stack MERN marketplace connecting households with local home-service providers including cooks, cleaners, plumbers, electricians, carpenters, painters, and construction labourers (majdoor). Every booking is tracked end-to-end inside HomeEase's signature **Digital Booking Logbook**.

---

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React, React Context API
- **Backend:** Node.js, Express.js, Mongoose, MongoDB, JWT (`jsonwebtoken`), `bcryptjs`, CORS
- **Database:** MongoDB (supports MongoDB Atlas via `MONGODB_URI` with automatic embedded local MongoDB fallback via `mongodb-memory-server` for zero-config previews)

---

## Project Architecture

```text
.
├── server.ts                      # Full-stack Express + Vite entry point (port 3000)
├── server/
│   ├── app.ts                     # Express API router & middleware setup
│   ├── config/db.ts               # MongoDB Atlas / local embedded MongoDB connection
│   ├── models/                    # Mongoose schemas (User, WorkerProfile, Booking, Review)
│   ├── middleware/                # JWT authentication, RBAC role guards, error handler
│   ├── controllers/               # Auth, Worker, Booking, Review, and User controllers
│   ├── routes/                    # Modular REST API routes
│   ├── utils/                     # Pure booking state-machine rules & JWT helpers
│   └── seed/                      # Seed data & CLI seed runner
├── src/
│   ├── components/                # Navbar, Footer, WorkerCard, BookingTimeline, Logbook, Modals
│   ├── context/                   # AuthContext & ToastContext
│   ├── layouts/                   # Responsive DashboardLayout
│   ├── pages/                     # Landing, Explore, Worker Profile, Login/Register, Dashboards
│   ├── services/api.ts            # Axios client with Bearer JWT interceptor
│   ├── types/                     # Shared TypeScript interfaces
│   └── utils/                     # Query builders, formatters, unit tests
├── .env.example
└── package.json
```

---

## Local Setup & Execution

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   Copy `.env.example` to `.env` and optionally supply your MongoDB Atlas `MONGODB_URI` and a strong `JWT_SECRET`.
   *(If `MONGODB_URI` is left blank or as a placeholder, HomeEase automatically starts a local embedded MongoDB instance and seeds demo data on startup.)*
3. **Seed the database manually (optional):**
   ```bash
   npm run seed
   ```
4. **Start the development server (API + Frontend on port 3000):**
   ```bash
   npm run dev
   ```
5. **Run unit tests:**
   ```bash
   npm test
   ```
6. **Build for production:**
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

---

## Seeded Demo Credentials

| Role | Name | Location | Email | Password |
| :--- | :--- | :--- | :--- | :--- |
| Customer | Aarav Mehta | Model Town, Ambala City, Haryana | `customer@homeease.demo` | `Password@123` |
| Cook | Rekha Joshi | Model Town, Ambala City, Haryana | `rekha.cook@homeease.demo` | `Worker@101` |
| Cleaner | Pooja Verma | Ambala Cantt, Haryana | `pooja.cleaner@homeease.demo` | `Worker@102` |
| Plumber | Deepak Tiwari | Sector 9, Ambala City, Haryana | `deepak.plumber@homeease.demo` | `Worker@103` |
| Electrician | Arjun Nair | Sector 20, Panchkula, Haryana | `arjun.electrician@homeease.demo` | `Worker@104` |
| Carpenter | Harish Vishwakarma | Sector 22, Chandigarh | `harish.carpenter@homeease.demo` | `Worker@105` |
| Painter | Manoj Saini | Sector 13, Kurukshetra, Haryana | `manoj.painter@homeease.demo` | `Worker@106` |
| Construction Labour | Santosh Chauhan | Model Town, Karnal, Haryana | `santosh.labour@homeease.demo` | `Worker@107` |
| Cook & Cleaner | Savita Pawar | DLF Phase 3, Gurugram, Haryana | `savita.helper@homeease.demo` | `Worker@108` |

---

## REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a new Customer or Worker (hashes password with bcrypt, returns JWT)
- `POST /api/auth/login` — Authenticate user and issue JWT
- `GET /api/auth/me` — Get currently authenticated user from JWT (`Bearer <token>`)

### Workers
- `GET /api/workers` — List workers with optional filters (`category`, `location`, `minPrice`, `maxPrice`, `minExperience`, `minRating`, `available`, `sort`, `limit`)
- `GET /api/workers/search` — Full-text + multi-criteria worker search (`q`, filters, sorting)
- `GET /api/workers/:id` — Get individual worker profile and customer reviews
- `GET /api/workers/me/profile` — *(Worker only)* Fetch logged-in worker's profile
- `POST /api/workers/profile` — *(Worker only)* Create professional worker profile
- `PUT /api/workers/profile` — *(Worker only)* Update categories, experience, description, pricing, availability

### Bookings & Digital Booking Logbook
- `POST /api/bookings` — *(Customer only)* Create booking with server-validated date, duplicate guard, server-quoted price, and unique `HE-YYYY-NNNNNN` ID
- `GET /api/bookings/my` — *(Authenticated)* List customer's or worker's bookings + summary stats
- `GET /api/bookings/:id` — *(Owner/Assigned worker only)* Fetch single booking record
- `PATCH /api/bookings/:id/status` — *(Assigned worker only)* Transition `Pending → Accepted/Rejected` or `Accepted → Completed`, recording timestamped `statusHistory`
- `PATCH /api/bookings/:id/cancel` — *(Booking customer only)* Cancel `Pending` booking

### Reviews
- `POST /api/reviews` — *(Customer only)* Submit 1–5 star rating and comment on own `Completed` booking (one per booking); recalculates worker average rating
- `GET /api/reviews/worker/:workerId` — Public worker reviews
- `GET /api/reviews/my` — Reviews written by customer or received by worker

### Users
- `GET /api/users/profile` — Get current user account
- `PUT /api/users/profile` — Update name, phone, location, profile image
- `PUT /api/users/change-password` — Verify current password and update bcrypt-hashed password

---

## Deployment Instructions

1. Provision a **MongoDB Atlas** cluster and whitelist your hosting server IP.
2. Set environment variables on your host (Render, Railway, Cloud Run, or VPS):
   - `NODE_ENV=production`
   - `PORT=3000`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `JWT_SECRET=<64-char-random-secret>`
3. Run `npm run build` during the build phase and `npx tsx server.ts` (or `npm start`) as the start command.
