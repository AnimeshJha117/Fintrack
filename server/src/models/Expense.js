import { Schema, model } from "mongoose";
const ExpenseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: "Amount must be an integer" },
    },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);
ExpenseSchema.index({ user: 1, date: -1 });
export const ExpenseModel = model("Expense", ExpenseSchema);
