# Fintrack

A full-stack expense tracker with receipt scanning, budget alerts, spending insights, cash-flow projection, and recurring expenses/savings.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, Recharts
- **Backend:** Node.js, Express, TypeScript, Mongoose, JWT, bcrypt, Multer, Zod, Helmet
- **Database/Storage:** MongoDB Atlas, Cloudinary
- **OCR:** Tesseract.js
- **Testing/Tools:** Vitest, Playwright, Postman, Swagger/OpenAPI

## Project Structure

```
expense-tracker/
├── client/   # React frontend
├── server/   # Express API
└── shared/   # Zod schemas and types shared by both
```

## Prerequisites

- Git
- Node.js installed via [nvm](https://github.com/nvm-sh/nvm)
- MongoDB Atlas cluster set as `MONGODB_URI` in `server/.env`

## Getting Started

```bash
git clone https://github.com/AnimeshJha117/Fintrack
cd expense-tracker
nvm use
```

### Run the server

```bash
cd server
npm install
npm run dev
```

Check it works: `curl http://localhost:4000/api/health` should return `{"status":"ok"}`.

## Scripts (server)

| Command              | Function                             |
| ---------------------| ------------------------------------ |
| `npm run dev`        | Start with auto-reload (development) |
| `npm run build`      | Compile TypeScript to `dist/`        |
| `npm start`          | Run the compiled build               |
| `npm test`           | Run the test suite once              |
| `npm run test:watch` | Re-run tests on file changes         |

## Testing

Server tests use Vitest and supertest against an in-memory MongoDB, so no database setup or `.env` file is needed:

```bash
cd server
npm test
```

## API

| Method | Endpoint             | Body                        | Description                                       |
| ------ | -------------------- | --------------------------- | --------------------------------------------------|
| GET    | `/api/health`        |                             | Health check                                      |
| POST   | `/api/auth/register` | `name`, `email`, `password` | Create a new user                                 |
| POST   | `/api/auth/login`    | `email`, `password`         | Log in, returns access token, sets refresh cookie |
| POST   | `/api/auth/refresh`  |                             | New access token using the refresh cookie         |
| POST   | `/api/auth/logout`   |                             | Clear the refresh cookie                          |
| GET    | `/api/auth/me`       | Bearer token                | Get the logged-in user                            |