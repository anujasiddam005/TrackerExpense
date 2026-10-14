
import express from "express";
import authMiddleware from "../middleware/auth.js";

import { addExpense, deleteExpense, getAllExpense, updateExpense,downloadExpenseExcel,getExpenseOverview } from "../controllers/expenseController.js";

const expenseRouter = express.Router();

// Add EXPENSE
expenseRouter.post("/add", authMiddleware, addExpense);

// Get all EXPENSE
expenseRouter.get("/", authMiddleware, getAllExpense);


expenseRouter.put("/update/:id", authMiddleware, updateExpense);

expenseRouter.get("/downloadexcel", authMiddleware, downloadExpenseExcel);



expenseRouter.delete("/delete/:id", authMiddleware, deleteExpense);

expenseRouter.get("/overview", authMiddleware,getExpenseOverview);

export default expenseRouter;