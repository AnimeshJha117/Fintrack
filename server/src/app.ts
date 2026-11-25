import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { AuthRouter } from "./routes/auth.routes.js";
import { ExpenseRouter } from "./routes/expense.routes.js";
import { NotFound, ErrorHandler } from "./middleware/ErrorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", AuthRouter);
app.use("/api/expenses", ExpenseRouter);
app.use(NotFound);
app.use(ErrorHandler);