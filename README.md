# DigitalBank — Full-Stack Digital Banking System

A production-ready MERN stack digital banking platform with accounts, transfers, loans, cards, KYC, and an admin console.

**Stack:** MongoDB · Express · React (Vite) · Node.js · Tailwind CSS

---

## ✨ Features

**Customer**
- JWT auth with email verification, password reset, account lockout after failed attempts
- Multiple account types: Savings, Checking, Fixed Deposit, Recurring Deposit
- Atomic fund transfers (MongoDB transactions — no double-spend / partial-write risk)
- Deposits, withdrawals, bill payments, account statements with date filters
- Loan applications, EMI calculator, automated EMI schedule, repayment tracking
- Debit/credit/virtual card issuance, PIN setup, freeze/block, spend controls
- KYC document upload (Cloudinary), profile management, notification preferences
- Dashboard with spending analytics (category breakdown + monthly trend charts)
- In-app notifications + email alerts (Nodemailer)

**Admin**
- Bank-wide dashboard (users, deposits, transaction volume, pending reviews)
- KYC approval/rejection workflow
- Loan review → approval → disbursement pipeline
- User account activation/deactivation

**Engineering**
- Rate limiting, Helmet, Mongo sanitization, bcrypt password hashing
- Centralized error handling, Winston logging
- Mongoose transactions for all money-movement operations
- Fully responsive, accessible UI with a custom design system (Tailwind)

---

## 📁 Project Structure

```
digital_banking/
├── backend/                 # Express API
│   ├── config/               # Cloudinary config
│   ├── controllers/          # Route handlers (business logic)
│   ├── middleware/           # auth, error handler, validators
│   ├── models/                # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── utils/                  # logger, email
│   ├── server.js
│   ├── package.json
│   ├── render.yaml            # Render deployment blueprint
│   └── .env.example
└── frontend/                 # React (Vite) SPA
    ├── src/
    │   ├── components/        # common, layout, dashboard, auth, accounts, transactions, loans, cards
    │   ├── context/            # AuthContext
    │   ├── pages/                # route-level pages
    │   ├── services/            # axios API layer
    │   ├── utils/                # formatters
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vercel.json
    └── .env.example
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A Cloudinary account (free tier) — for profile pictures & KYC docs
- An SMTP provider (Gmail App Password works fine) — for emails

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, SMTP_*, CLOUDINARY_*, CLIENT_URL, ADMIN_REGISTRATION_KEY
npm install
npm run dev          # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev           # starts on http://localhost:5173
```

### 3. Create an admin account
Register normally via `/register`, but include `"adminKey": "<ADMIN_REGISTRATION_KEY>"` in the request body (e.g. via Postman) to be assigned the `admin` role. Admin users do not get an auto-created savings account.

---

## ☁️ Deployment

### Backend → Render

1. Push the `backend/` folder to a Git repository.
2. In Render: **New → Web Service**, connect the repo, root directory = `backend`.
3. Render auto-detects `render.yaml`. Alternatively set manually:
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path: `/health`
4. Add environment variables in the Render dashboard (see `.env.example`):
   `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `JWT_COOKIE_EXPIRE`, `CLIENT_URL` (your Vercel URL), `SMTP_*`, `FROM_EMAIL`, `FROM_NAME`, `CLOUDINARY_*`, `ADMIN_REGISTRATION_KEY`, `NODE_ENV=production`.
5. Deploy. Note your backend URL, e.g. `https://digital-banking-backend.onrender.com`.

### Frontend → Vercel

1. Push the `frontend/` folder to a Git repository (or same repo, different root).
2. In Vercel: **New Project**, import the repo, root directory = `frontend`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
4. Add environment variable:
   - `VITE_API_URL` = `https://<your-render-backend>.onrender.com/api`
5. Deploy. `vercel.json` is already included for SPA routing (rewrites all paths to `index.html`).

### Final step
Go back to Render and update `CLIENT_URL` to your live Vercel URL (e.g. `https://digital-banking.vercel.app`) so CORS and email reset links work correctly. Redeploy the backend.

---

## 🔐 Security Notes for Production

- Replace `JWT_SECRET` and `ADMIN_REGISTRATION_KEY` with long, random values (`openssl rand -hex 32`).
- Use a transactional email provider (SendGrid, Mailgun, SES) instead of Gmail SMTP at scale.
- Enable MongoDB Atlas IP allowlisting or use Render's static outbound IPs.
- Consider adding 2FA (schema fields already scaffolded on the `User` model) and a Web Application Firewall in front of the API for full production hardening.

---

## 📜 License
MIT — for educational/demo purposes. Not audited for real financial use.
