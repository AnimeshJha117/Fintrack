import { Router } from "express";
import mongoose from "mongoose";
import { ExpenseModel } from "../models/Expense.js";
import { RequireAuth } from "../middleware/requireauth.js";
import { validate } from "../middleware/validate.js";
import {
  CreateExpenseSchema,
  UpdateExpenseSchema,
  ListExpensesQuerySchema,
} from "../schemas/expense.schema.js";
export const ExpenseRouter = Router();
ExpenseRouter.use(RequireAuth);
function toDTO(e) {
  return {
    id: e.id,
    amount: e.amount,
    category: e.category,
    description: e.description,
    date: e.date,
  };
}
ExpenseRouter.post("/", validate(CreateExpenseSchema), async (req, res) => {
  const expense = await ExpenseModel.create({ ...req.body, user: req.UserId });
  res.status(201).json(toDTO(expense));
});
ExpenseRouter.get("/", async (req, res) => {
  const parsed = ListExpensesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  const { month, category } = parsed.data;
  const filter = { user: req.UserId };
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    filter.date = {
      $gte: new Date(Date.UTC(year, mon - 1, 1)),
      $lt: new Date(Date.UTC(year, mon, 1)),
    };
  }
  if (category) filter.category = category;
  const expenses = await ExpenseModel.find(filter).sort({ date: -1 }).limit(100);
  res.json(expenses.map(toDTO));
});
ExpenseRouter.get("/categories", async (req, res) => {
  const categories = await ExpenseModel.distinct("category", { user: req.UserId });
  res.json(categories.sort());
});
ExpenseRouter.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  const expense = await ExpenseModel.findOne({ _id: req.params.id, user: req.UserId });
  if (!expense) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  res.json(toDTO(expense));
});
ExpenseRouter.patch("/:id", validate(UpdateExpenseSchema), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  const expense = await ExpenseModel.findOneAndUpdate(
    { _id: req.params.id, user: req.UserId },
    req.body,
    { new: true, runValidators: true },
  );
  if (!expense) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  res.json(toDTO(expense));
});
ExpenseRouter.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  const expense = await ExpenseModel.findOneAndDelete({
    _id: req.params.id,
    user: req.UserId,
  });
  if (!expense) {
    res.status(404).json({ message: "Expense not found" });
    return;
  }
  res.status(204).send();
});
