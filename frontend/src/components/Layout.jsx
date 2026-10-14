import { styles } from "../assets/dummyStyles";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Utensils,
  Home,
  Car,
  ShoppingCart,
  Gift,
  Zap,
  Activity,
  ArrowUp,
  CreditCard,
  PiggyBank,
  IndianRupee,
  ArrowDown,
  TrendingUp,
  RefreshCw,
  Clock,
  Info,
  ChevronUp,
  PieChart,
} from "lucide-react";

const API_BASE = "http://localhost:4000/api";

// Format amounts in Indian Rupees
const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const CATEGORY_ICONS = {
  Food: <Utensils className="w-4 h-4" />,
  Housing: <Home className="w-4 h-4" />,
  Transport: <Car className="w-4 h-4" />,
  Shopping: <ShoppingCart className="w-4 h-4" />,
  Entertainment: <Gift className="w-4 h-4" />,
  Utilities: <Zap className="w-4 h-4" />,
  Healthcare: <Activity className="w-4 h-4" />,
  Salary: <ArrowUp className="w-4 h-4" />,
  Freelance: <CreditCard className="w-4 h-4" />,
  Savings: <PiggyBank className="w-4 h-4" />,
};

// Filter transactions by timeframe
const filterTransactions = (transactions, frame) => {
  const now = new Date();
  const today = new Date(now).setHours(0, 0, 0, 0);

  switch (frame) {
    case "daily":
      return transactions.filter((t) => new Date(t.date) >= today);

    case "weekly": {
      const startOfWeek = new Date(today);

      startOfWeek.setDate(
        startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7),
      );

      return transactions.filter((t) => new Date(t.date) >= startOfWeek);
    }

    case "monthly":
      return transactions.filter((t) => {
        const date = new Date(t.date);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });

    case "yearly":
      return transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === now.getFullYear();
      });

    default:
      return transactions;
  }
};

const safeArrayFromResponse = (res) => {
  const body = res?.data;

  if (!body) return [];

  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.incomes)) return body.incomes;
  if (Array.isArray(body.expenses)) return body.expenses;

  return [];
};

const Layout = ({ onLogout, user }) => {
  const [transactions, setTransactions] = useState([]);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fetch transactions from the server
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [incomeRes, expenseRes] = await Promise.all([
        axios.get(`${API_BASE}/income/`, { headers }),
        axios.get(`${API_BASE}/expense/`, { headers }),
      ]);

      const incomes = safeArrayFromResponse(incomeRes).map((i) => ({
        ...i,
        type: "income",
      }));

      const expenses = safeArrayFromResponse(expenseRes).map((e) => ({
        ...e,
        type: "expense",
      }));

      const allTransactions = [...incomes, ...expenses]
        .map((t) => ({
          id: t._id || t.id || t.id_str || Math.random().toString(36).slice(2),

          description: t.description || t.title || t.note || "",

          amount: t.amount != null ? Number(t.amount) : Number(t.value) || 0,

          date: t.date || t.createdAt || new Date().toISOString(),

          category: t.category || t.type || "Other",

          type: t.type,

          raw: t,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Failed to fetch transactions",
        err?.response || err.message || err,
      );
    } finally {
      setLoading(false);
    }
  };

  // Add transaction
  const addTransaction = async (transaction) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const endpoint =
        transaction.type === "income" ? "income/add" : "expense/add";

      await axios.post(`${API_BASE}/${endpoint}`, transaction, { headers });

      await fetchTransactions();

      return true;
    } catch (err) {
      console.error(
        "Failed to add transaction",
        err?.response || err.message || err,
      );

      throw err;
    }
  };

  // Update transaction
  const editTransaction = async (id, transaction) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const endpoint =
        transaction.type === "income" ? "income/update" : "expense/update";

      await axios.put(`${API_BASE}/${endpoint}/${id}`, transaction, {
        headers,
      });

      await fetchTransactions();

      return true;
    } catch (err) {
      console.error(
        "Failed to edit transaction",
        err?.response || err.message || err,
      );

      throw err;
    }
  };

  // Delete transaction
  const deleteTransaction = async (id, type) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const endpoint = type === "income" ? "income/delete" : "expense/delete";

      await axios.delete(`${API_BASE}/${endpoint}/${id}`, { headers });

      await fetchTransactions();

      return true;
    } catch (err) {
      console.error(
        "Failed to delete transaction",
        err?.response || err.message || err,
      );

      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, timeFrame),
    [transactions, timeFrame],
  );

  // Dashboard statistics
  const stats = useMemo(() => {
    const now = new Date();

    // Current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    startOfMonth.setHours(0, 0, 0, 0);

    const currentMonthTransactions = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth,
    );

    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // All-time totals
    const allTimeIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const allTimeExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Savings rate
    const savingsRate =
      currentMonthIncome > 0
        ? Math.round(
            ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) *
              100,
          )
        : 0;

    // Previous month
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    startOfPreviousMonth.setHours(0, 0, 0, 0);

    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    endOfPreviousMonth.setHours(23, 59, 59, 999);

    const previousMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);

      return date >= startOfPreviousMonth && date <= endOfPreviousMonth;
    });

    const previousMonthIncome = previousMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const previousMonthExpenses = previousMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Income change
    const incomeChange =
      previousMonthIncome > 0
        ? Math.round(
            ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) *
              100,
          )
        : 0;

    // Expense change
    const expenseChange =
      previousMonthExpenses > 0
        ? Math.round(
            ((currentMonthExpenses - previousMonthExpenses) /
              previousMonthExpenses) *
              100,
          )
        : 0;

    return {
      totalTransactions: transactions.length,

      currentMonthIncome,
      currentMonthExpenses,

      currentMonthSavings: currentMonthIncome - currentMonthExpenses,

      allTimeIncome,
      allTimeExpenses,

      allTimeSavings: allTimeIncome - allTimeExpenses,

      currentMonthCount: currentMonthTransactions.length,

      savingsRate,
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  const timeFrameLabel = useMemo(
    () =>
      timeFrame === "daily"
        ? "Today"
        : timeFrame === "weekly"
          ? "This Week"
          : timeFrame === "monthly"
            ? "This Month"
            : "This Year",
    [timeFrame],
  );

  const outletContext = {
    transactions: filteredTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    timeFrame,
    setTimeFrame,
    lastUpdated,
  };

  const getSavingsRating = (rate) =>
    rate > 30 ? "Excellent" : rate > 20 ? "Good" : "Needs improvement";

  const topCategories = useMemo(
    () =>
      Object.entries(
        transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount);

            return acc;
          }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [transactions],
  );

  const displayedTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 4);

  return (
    <div className={styles.layout.root}>
      <Navbar user={user} onLogout={onLogout} />

      <Sidebar
        user={user}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className={styles.header.container}>
          <div>
            <h1 className={styles.header.title}>Dashboard</h1>
            <p className={styles.header.subtitle}>Welcome Back</p>
          </div>
        </div>

        <div className={styles.statCards.grid}>
          {/* Total Balance */}
          <div className={styles.statCards.card}>
            <div className={styles.statCards.cardHeader}>
              <div>
                <p className={styles.statCards.cardTitle}>Total Balance</p>

                <p className={styles.statCards.cardValue}>
                  {formatCurrency(stats.allTimeSavings)}
                </p>
              </div>

              <div className={styles.statCards.iconContainer("teal")}>
                <IndianRupee className={styles.statCards.icon("teal")} />
              </div>
            </div>

            <p className={styles.statCards.cardFooter}>
              <span className="text-teal-600 font-medium">
                {formatCurrency(stats.currentMonthSavings)}
              </span>{" "}
              this month
            </p>
          </div>

          {/* Monthly Income */}
          <div className={styles.statCards.card}>
            <div className={styles.statCards.cardHeader}>
              <div>
                <p className={styles.statCards.cardTitle}>Monthly Income</p>

                <p className={styles.statCards.cardValue}>
                  {formatCurrency(stats.currentMonthIncome)}
                </p>
              </div>

              <div className={styles.statCards.iconContainer("green")}>
                <ArrowUp className={styles.statCards.icon("green")} />
              </div>
            </div>

            <p className={styles.statCards.cardFooter}>
              <span className="text-green-600 font-medium">
                {stats.incomeChange > 0 ? "+" : ""}
                {stats.incomeChange}%
              </span>{" "}
              from last month
            </p>
          </div>

          {/* Monthly Expense */}
          <div className={styles.statCards.card}>
            <div className={styles.statCards.cardHeader}>
              <div>
                <p className={styles.statCards.cardTitle}>Monthly Expense</p>

                <p className={styles.statCards.cardValue}>
                  {formatCurrency(stats.currentMonthExpenses)}
                </p>
              </div>

              <div className={styles.statCards.iconContainer("orange")}>
                <ArrowDown className={styles.statCards.icon("orange")} />
              </div>
            </div>

            <p className={styles.statCards.cardFooter}>
              <span
                className={`${styles.colors.expenseChange(
                  stats.expenseChange,
                )} font-medium`}
              >
                {stats.expenseChange > 0 ? "+" : ""}
                {stats.expenseChange}%
              </span>{" "}
              from last month
            </p>
          </div>

          {/* Saving Rate */}
          <div className={styles.statCards.card}>
            <div className={styles.statCards.cardHeader}>
              <div>
                <p className={styles.statCards.cardTitle}>Saving Rate</p>

                <p className={styles.statCards.cardValue}>
                  {stats.savingsRate}%
                </p>
              </div>

              <div className={styles.statCards.iconContainer("blue")}>
                <PiggyBank className={styles.statCards.icon("blue")} />
              </div>
            </div>

            <p className={styles.statCards.cardFooter}>
              {getSavingsRating(stats.savingsRate)}
            </p>
          </div>
        </div>

        <div className={styles.grid.main}>
          <div className={styles.grid.leftColumn}>
            <div className={styles.cards.base}>
              <div className={styles.cards.header}>
                <h3 className={styles.cards.title}>
                  <TrendingUp className="w-6 h-6 text-teal-500" />
                  Financial Overview
                  <span className="text-sm text-gray-500 font-normal">
                    ({timeFrameLabel})
                  </span>
                </h3>
              </div>

              <Outlet context={outletContext} />
            </div>
          </div>

          {/* Right side */}
          <div className={styles.grid.rightColumn}>
            {/* Recent Transactions */}
            <div className={styles.cards.base}>
              <div className={styles.transactions.cardHeader}>
                <h3 className={styles.transactions.cardTitle}>
                  <Clock className="w-6 h-6 text-purple-500" />
                  Recent Transactions
                </h3>

                <button
                  onClick={fetchTransactions}
                  disabled={loading}
                  className={styles.transactions.refreshButton}
                >
                  <RefreshCw
                    className={styles.transactions.refreshIcon(loading)}
                  />
                </button>
              </div>

              <div className={styles.transactions.dataStackingInfo}>
                <Info className={styles.transactions.dataStackingIcon} />

                <span>Transactions are stacked by date (newest first)</span>
              </div>

              <div className={styles.transactions.listContainer}>
                {displayedTransactions.map((transaction) => {
                  const { id, type, category, description, date, amount } =
                    transaction;

                  return (
                    <div
                      key={id}
                      className={styles.transactions.transactionItem}
                    >
                      <div className="flex items-center gap-1 md:gap-4 lg:gap-3">
                        <div
                          className={`p-2 rounded-lg ${styles.colors.transaction.bg(
                            type,
                          )}`}
                        >
                          {CATEGORY_ICONS[category] || (
                            <IndianRupee className={styles.transactions.icon} />
                          )}
                        </div>

                        <div className={styles.transactions.details}>
                          <p className={styles.transactions.description}>
                            {description}
                          </p>

                          <p className={styles.transactions.meta}>
                            {new Date(date).toLocaleDateString("en-IN")}

                            <span className="ml-2 capitalize"></span>
                          </p>
                        </div>
                      </div>

                      <span className={styles.colors.transaction.text(type)}>
                        {type === "income" ? "+" : "-"}
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  );
                })}

                {transactions.length === 0 ? (
                  <div className={styles.transactions.emptyState}>
                    <div className={styles.transactions.emptyIconContainer}>
                      <div className={styles.transactions.emptyIcon} />
                    </div>

                    <p className={styles.transactions.emptyText}>
                      No recent transactions
                    </p>
                  </div>
                ) : (
                  <div className={styles.transactions.viewAllContainer}>
                    <button
                      onClick={() =>
                        setShowAllTransactions(!showAllTransactions)
                      }
                      className={styles.transactions.viewAllButton}
                    >
                      {showAllTransactions ? (
                        <>
                          <ChevronUp className="w-5 h-5" />
                          Show Less
                        </>
                      ) : (
                        "View all transactions"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Spending by Category */}
            <div className={styles.cards.base}>
              <h3 className={styles.categories.title}>
                <PieChart className={styles.categories.titleIcon} />
                SPENDING BY CATEGORY
              </h3>

              <div className={styles.categories.list}>
                {topCategories.map(([category, amount]) => (
                  <div
                    key={category}
                    className={styles.categories.categoryItem}
                  >
                    <div className={styles.categories.categoryIconContainer}>
                      {CATEGORY_ICONS[category] || (
                        <IndianRupee
                          className={styles.categories.categoryIcon}
                        />
                      )}
                    </div>

                    <span className={styles.categories.categoryName}>
                      {category}
                    </span>

                    <span className={styles.categories.categoryAmount}>
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.categories.summaryContainer}>
                <div className={styles.categories.summaryGrid}>
                  <div className={styles.categories.summaryIncomeCard}>
                    <p className={styles.categories.summaryTitle}>
                      Total Income
                    </p>

                    <p className={styles.categories.summaryValue}>
                      {formatCurrency(stats.allTimeIncome)}
                    </p>
                  </div>

                  <div className={styles.categories.summaryExpenseCard}>
                    <p className={styles.categories.summaryTitle}>
                      Total Expense
                    </p>

                    <p className={styles.categories.summaryValue}>
                      {formatCurrency(stats.allTimeExpenses)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
