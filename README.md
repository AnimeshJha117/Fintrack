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
├── client/   # React frontend (not set up yet)
├── server/   # Express API
└── shared/   # Zod schemas and types shared by both (not set up yet)
```

## Prerequisites

- Git
- Node.js installed via [nvm](https://github.com/nvm-sh/nvm)

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

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start with auto-reload (development) |
| `npm run build` | Compile TypeScript to `dist/`        |
| `npm start`     | Run the compiled build               |