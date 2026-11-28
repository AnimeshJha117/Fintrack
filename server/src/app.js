import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import { AuthRouter } from "./routes/auth.routes.js";
import { ExpenseRouter } from "./routes/expense.routes.js";
import { NotFound, ErrorHandler } from "./middleware/ErrorHandler.js";
import swaggerui from "swagger-ui-express";
import { OpenApiSpec } from "./docs/openapi.js";
export const app = express();
app.set("trust proxy", 1);
if (env.NODE_ENV !== "production") {
  app.use("/api/docs", swaggerui.serve, swaggerui.setup(OpenApiSpec));
}
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/auth", AuthRouter);
app.use("/api/expenses", ExpenseRouter);
app.use(NotFound);
app.use(ErrorHandler);
