import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dateFilter.js";

// Add income
export async function addIncome(req, res) {
  const userId = req.user.id;

  const { description, amount, category, date } = req.body;

  // Check required fields
  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create income
    const newIncome = new incomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    await newIncome.save();
    res.json({
      success: true,
      message: "Income added successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

//to get income(all)
export async function getAllIncome(req, res) {
  const userId = req.user.id;
  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Update income
export async function updateIncome(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  const { description, amount } = req.body;

  try {
    // Find and update income belonging to logged-in user
    const updatedIncome = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      {
        description,
        amount,
      },
      { new: true },
    );

    // Income not found
    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    res.json({
      success: true,
      message: "Income updated successfully",
      data: updatedIncome,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

// Delete income
export async function deleteIncome(req, res) {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // Find and delete income belonging to logged-in user
    const income = await incomeModel.findOneAndDelete({
      _id: id,
      userId,
    });

    // Income not found
    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    return res.json({
      success: true,
      message: "Income deleted successfully",
      income,
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
export async function downloadIncomeExcel(req, res) {
  const userId = req.user.id;

  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });

    // Prepare data for Excel
    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: new Date(inc.date).toLocaleDateString(),
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(plainData);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");

    XLSX.writeFile(workbook, "income_details.xlsx");
    res.download("income_details.xlsx");
  } catch (error) {
    console.log("Download income error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
// Get income overview
export async function getIncomeOverview(req, res) {
  try {
    const userId = req.user.id;

    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);
    const incomes = await incomeModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;

    const recentTransactions = incomes.slice(0, 9);

    res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (error) {
    console.log("Income overview error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
