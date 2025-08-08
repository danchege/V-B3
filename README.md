# V!B3

A modern full-stack matchmaking and chat application, featuring a React + Vite frontend and an Express/MongoDB backend. This project enables users to swipe, match, and chat in real time, with a clean, mobile-friendly UI and robust backend API.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Setup & Installation](#setup--installation)
- [Backend API Overview](#backend-api-overview)
- [Frontend Overview](#frontend-overview)
- [Environment Variables](#environment-variables)
- [Development Tips](#development-tips)

---

## Features
- User registration & authentication (JWT-based)
- Profile setup with bio, age, gender, interests, and photos
- Swipe-based matching system
- Real-time chat between matched users
- Responsive, modern UI with React, Tailwind CSS, and Vite

---

## Project Structure
```
V!B3/
  backend/      # Express.js API, MongoDB models, controllers, routes
  frontend/     # React app (Vite), components, pages, assets
  package.json  # Monorepo or root-level scripts (if any)
```

---

## Technology Stack
- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **Dev Tools:** ESLint, Nodemon, PostCSS, Autoprefixer

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (or npm/yarn)
- MongoDB (local or Atlas)

### 1. Clone the repository
```sh
git clone <repo-url>
cd V!B3
```

### 2. Install dependencies
```sh
cd backend && pnpm install
cd ../frontend && pnpm install
```

### 3. Configure environment variables
Create a `.env` file in `backend/` with:
```
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/vib3
```

### 4. Start the backend server
```sh
cd backend
pnpm run dev
# or: pnpm start
```

### 5. Start the frontend dev server
```sh
cd frontend
pnpm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Backend API Overview

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT

### User
- `GET /api/user/profile` — Get current user profile
- `PUT /api/user/profile` — Update profile
- `DELETE /api/user/profile` — Delete account

### Match
- `POST /api/match/swipe` — Swipe (like/dislike) on a user
- `GET /api/match` — Get all matches for current user

### Chat
- `POST /api/chat/send` — Send message in a match
- `GET /api/chat/:matchId` — Get messages for a match

#### User Model
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `bio` (String)
- `age` (Number)
- `gender` (male, female, other)
- `interests` (Array of String)
- `photos` (Array of String)

---

## Frontend Overview
- Built with React + Vite for fast HMR and modern DX
- Main pages: Swipe, Chat, Profile Setup, Settings, Home
- Components: Card, Button, Modal, Navbar, LoadingSpinner
- Uses Tailwind CSS for styling and utility classes
- API requests handled via `src/utils/api.js`

---

## Environment Variables
- **Backend:** `.env` file for JWT secret and MongoDB URI
- **Frontend:** (If needed, add VITE_ prefixed variables in `frontend/.env`)

---

## Development Tips
- Use `pnpm run dev` in both backend and frontend for live reload
- Backend uses Nodemon for auto-restart
- Frontend uses Vite for fast refresh
- Lint code with `pnpm run lint` in frontend
- Customize Tailwind in `tailwind.config.js`

---

## License
MIT (or specify your license)

---

## Credits
- Inspired by modern dating apps and open-source full-stack templates