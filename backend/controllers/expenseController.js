import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dateFilter.js";
import XLSX from "xlsx";

// Add expense
export async function addExpense(req, res) {
  const userId = req.user.id;

  const { description, amount, category, date } = req.body;

  try {
    // Check required fields
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create expense
    const newExpense = new expenseModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    await newExpense.save();

    res.json({
      success: true,
      message: "Expense added successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

//to get expense(all)
export async function getAllExpense(req, res) {
  const userId = req.user.id;
  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });
    res.json(expense);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Update expense
export async function updateExpense(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const { description, amount } = req.body;

  try {
    // Find and update income belonging to logged-in user
    const updatedExpense = await expenseModel.findOneAndUpdate(
      { _id: id, userId },
      {
        description,
        amount,
      },
      { new: true },
    );

    // Income not found
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "expense not found",
      });
    }

    res.json({
      success: true,
      message: "expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Delete expense
export async function deleteExpense(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Find and delete income belonging to logged-in user
    const expense = await expenseModel.findOneAndDelete({
      _id: id,
      userId,
    });

    // Income not found
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "expense not found",
      });
    }

    return res.json({
      success: true,
      message: "expense deleted successfully",
      expense,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Download income data as Excel
export async function downloadExpenseExcel(req, res) {
  const userId = req.user.id;

  try {
    const expense = await expenseModel.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const plainData = expense.map((exp) => ({
      Description: exp.description,
      Amount: exp.amount,
      Category: exp.category,
      Date: new Date(exp.date).toLocaleDateString(),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(plainData);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel");

    XLSX.writeFile(workbook, "expense_details.xlsx");
    res.download("expense_details.xlsx");
  } catch (error) {
    console.log("Download expense error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
// Get income overview
export async function getExpenseOverview(req, res) {
  try {
    const userId = req.user.id;

    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);

    const expense = await expenseModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;
    const recentTransactions = expense.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.log("Expense overview error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
