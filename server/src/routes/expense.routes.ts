import { Router } from "express";
import mongoose from "mongoose";
import { ExpenseModel } from "../models/Expense.js";
import { RequireAuth } from "../middleware/requireauth.js";
import { validate } from "../middleware/validate.js";
import { CreateExpenseSchema, UpdateExpenseSchema } from "../schemas/expense.schema.js";

export const ExpenseRouter = Router();

ExpenseRouter.use(RequireAuth);

function toDTO(e: InstanceType<typeof ExpenseModel>) {
    return {
        id: e.id,
        amount: e.amount,
        category: e.category,
        description: e.description,
        date: e.date,
    };
}

ExpenseRouter.post("/", validate(CreateExpenseSchema), async (req, res) => {
    const expense = await ExpenseModel.create({ ...req.body, user: req.userId });
    res.status(201).json(toDTO(expense));
});

ExpenseRouter.get("/", async (req, res) => {
    const expenses = await ExpenseModel.find({ user: req.userId })
        .sort({ date: -1 })
        .limit(100);
    res.json(expenses.map(toDTO));
});

ExpenseRouter.get("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) 
    {
        res.status(404).json({ message: "Expense not found" });
        return;
    }
    const expense = await ExpenseModel.findOne({ _id: req.params.id, user: req.userId });
    if (!expense) 
    {
        res.status(404).json({ message: "Expense not found" });
        return;
    }
    res.json(toDTO(expense));
});

ExpenseRouter.patch("/:id", validate(UpdateExpenseSchema), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) 
    {
        res.status(404).json({ message: "Expense not found" });
        return;
    }

    const expense = await ExpenseModel.findOneAndUpdate(
        { _id: req.params.id, user: req.userId },
        req.body,
        { new: true, runValidators: true },
    );
    
    if (!expense) 
    {
        res.status(404).json({ message: "Expense not found" });
        return;
    }
    res.json(toDTO(expense));
});

ExpenseRouter.delete("/:id", async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) 
    {
        res.status(404).json({ message: "Expense not found" });
        return;
    }

    const expense = await ExpenseModel.findOneAndDelete({
        _id: req.params.id,
        user: req.userId,
    });

    if (!expense) 
    {
        res.status(404).json({ message: "Expense not found" });
        return;
    }
    res.status(204).send();
});