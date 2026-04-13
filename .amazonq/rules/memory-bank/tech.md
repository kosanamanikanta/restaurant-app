# Technology Stack

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.4 | UI component library |
| React DOM | ^19.2.4 | DOM rendering |
| React Router DOM | ^7.14.0 | Client-side routing (BrowserRouter, Routes, Route) |
| Vite | ^8.0.4 | Build tool and dev server |
| ESLint | ^9.39.4 | Linting |
| eslint-plugin-react-hooks | ^7.0.1 | React hooks lint rules |
| eslint-plugin-react-refresh | ^0.5.2 | Fast refresh lint rules |

**Language**: JavaScript (JSX), CSS  
**Module system**: ES Modules (`type: "module"`)  
**Entry point**: `src/main.jsx` → mounts `<App>` into `#root`

## Backend

| Technology | Version | Purpose |
|---|---|---|
| Express | ^5.2.1 | HTTP server and routing |
| Mongoose | ^9.4.1 | MongoDB ODM |
| Multer | ^2.1.1 | Multipart file upload handling |
| bcrypt | ^6.0.0 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT auth token generation/verification |
| dotenv | ^17.4.1 | Environment variable loading |
| cors | ^2.8.6 | Cross-origin resource sharing |
| body-parser | ^2.2.2 | Request body parsing |
| stripe | ^22.0.1 | Payment processing |
| validator | ^13.15.35 | Input validation |
| nodemon | ^3.1.14 | Dev server auto-restart |

**Language**: JavaScript (ESM)  
**Module system**: ES Modules (`type: "module"`)  
**Entry point**: `server.js`  
**Port**: 4000 (hardcoded)

## Database
- **MongoDB Atlas** (cloud) — connection string via `process.env.MONGODB_URI`
- TLS enabled, `serverSelectionTimeoutMS: 5000`

## Environment Variables (backend/.env)
```
MONGODB_URI=<mongodb-atlas-connection-string>
```
JWT secret and Stripe keys expected as additional env vars.

## Development Commands

### Frontend
```bash
cd frontend
npm install       # install dependencies
npm run dev       # start Vite dev server (hot reload)
npm run build     # production build to dist/
npm run preview   # preview production build
npm run lint      # run ESLint
```

### Backend
```bash
cd backend
npm install       # install dependencies
npm run server    # start with nodemon (auto-restart on changes)
```

## API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | / | Health check — returns "API WORKING" |
| POST | /api/food/add | Add food item (multipart/form-data with image) |

## Key Configuration Files
- `frontend/vite.config.js` — Vite + React plugin config
- `frontend/eslint.config.js` — ESLint flat config
- `backend/.env` — secrets and connection strings
