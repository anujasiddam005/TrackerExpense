
import express from "express";
import authMiddleware from "../middleware/auth.js";

import {
  addIncome,
  getAllIncome,
  getIncomeOverview,
  updateIncome,
  deleteIncome,
  downloadIncomeExcel,
} from "../controllers/incomeController.js";

const incomeRouter = express.Router();

// Add income
incomeRouter.post("/add", authMiddleware, addIncome);

// Get all income
incomeRouter.get("/", authMiddleware, getAllIncome);


incomeRouter.put("/update/:id", authMiddleware, updateIncome);

incomeRouter.get("/downloadexcel", authMiddleware, downloadIncomeExcel);



incomeRouter.delete("/delete/:id", authMiddleware, deleteIncome);

incomeRouter.get("/overview", authMiddleware,getIncomeOverview);

export default incomeRouter;