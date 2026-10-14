// Get the current time frame range
export const getTimeFrameRange = (timeFrame) => {
  const now = new Date();
  const start = new Date(now);

  start.setHours(0, 0, 0, 0);

  if (timeFrame === "daily") {
    return {
      start,
      end: new Date(now),
      label: "Today",
    };
  }

  if (timeFrame === "weekly") {
    const startOfWeek = new Date(start);

    startOfWeek.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    return {
      start: startOfWeek,
      end: new Date(now),
      label: "This Week",
    };
  }

  if (timeFrame === "monthly") {
    const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);

    startOfMonth.setHours(0, 0, 0, 0);

    return {
      start: startOfMonth,
      end: new Date(now),
      label: "This Month",
    };
  }

  if (timeFrame === "yearly") {
    const startOfYear = new Date(start.getFullYear(), 0, 1);

    startOfYear.setHours(0, 0, 0, 0);

    return {
      start: startOfYear,
      end: new Date(now),
      label: "This Year",
    };
  }

  // Default → monthly
  const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);

  return {
    start: startOfMonth,
    end: new Date(now),
    label: "This Month",
  };
};

// Get the previous time frame range
export const getPreviousTimeFrameRange = (timeFrame) => {
  const now = new Date();
  const start = new Date(now);

  start.setHours(0, 0, 0, 0);

  // DAILY
  if (timeFrame === "daily") {
    const yesterday = new Date(start);

    yesterday.setDate(start.getDate() - 1);

    const end = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      23,
      59,
      59,
      999,
    );

    return {
      start: yesterday,
      end,
      label: "Yesterday",
    };
  }

  // WEEKLY
  if (timeFrame === "weekly") {
    const startOfLastWeek = new Date(start);

    startOfLastWeek.setDate(start.getDate() - ((start.getDay() + 6) % 7) - 7);

    startOfLastWeek.setHours(0, 0, 0, 0);

    const endOfLastWeek = new Date(startOfLastWeek);

    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999);

    return {
      start: startOfLastWeek,
      end: endOfLastWeek,
      label: "Last Week",
    };
  }

  // MONTHLY
  if (timeFrame === "monthly") {
    const startOfLastMonth = new Date(
      start.getFullYear(),
      start.getMonth() - 1,
      1,
    );

    startOfLastMonth.setHours(0, 0, 0, 0);

    const endOfLastMonth = new Date(start.getFullYear(), start.getMonth(), 0);

    endOfLastMonth.setHours(23, 59, 59, 999);

    return {
      start: startOfLastMonth,
      end: endOfLastMonth,
      label: "Last Month",
    };
  }

  // YEARLY
  if (timeFrame === "yearly") {
    const startOfLastYear = new Date(start.getFullYear() - 1, 0, 1);

    startOfLastYear.setHours(0, 0, 0, 0);

    const endOfLastYear = new Date(
      start.getFullYear() - 1,
      11,
      31,
      23,
      59,
      59,
      999,
    );

    return {
      start: startOfLastYear,
      end: endOfLastYear,
      label: "Last Year",
    };
  }

  // DEFAULT → Last Month
  const startOfLastMonth = new Date(
    start.getFullYear(),
    start.getMonth() - 1,
    1,
  );

  startOfLastMonth.setHours(0, 0, 0, 0);

  const endOfLastMonth = new Date(start.getFullYear(), start.getMonth(), 0);

  endOfLastMonth.setHours(23, 59, 59, 999);

  return {
    start: startOfLastMonth,
    end: endOfLastMonth,
    label: "Last Month",
  };
};
// Calculate income, expenses and savings
export const calculateData = (transactions = []) => {
  const totals = transactions.reduce(
    (data, t) => {
      const amount = Number(t.amount) || 0;

      if (t.type === "income") {
        data.income += amount;
      } else if (t.type === "expense") {
        data.expenses += amount;
      }

      return data;
    },
    {
      income: 0,
      expenses: 0,
    },
  );

  return {
    ...totals,
    savings: totals.income - totals.expenses,
  };
};

// Generate chart points
export const generateChartPoints = (timeFrame) => {
  const now = new Date();
  const points = [];

  // DAILY
  if (timeFrame === "daily") {
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);

      hour.setHours(i, 0, 0, 0);

      points.push({
        date: hour,
        label: hour.toLocaleTimeString([], {
          hour: "2-digit",
        }),
        hour: i,
        isCurrent: i === now.getHours(),
      });
    }
  }

  // WEEKLY
  else if (timeFrame === "weekly") {
    const start = new Date(now);

    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);

      day.setDate(start.getDate() + i);

      points.push({
        date: day,
        label: day.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        isCurrent:
          day.getDate() === now.getDate() &&
          day.getMonth() === now.getMonth() &&
          day.getFullYear() === now.getFullYear(),
      });
    }
  }

  // MONTHLY
  else if (timeFrame === "monthly") {
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(now.getFullYear(), now.getMonth(), i);

      points.push({
        date: day,
        label: day.toLocaleDateString("en-US", {
          day: "numeric",
        }),
        isCurrent: i === now.getDate(),
      });
    }
  }

  // YEARLY
  else if (timeFrame === "yearly") {
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), i, 1);

      points.push({
        date: month,
        label: month.toLocaleDateString("en-US", {
          month: "short",
        }),
        isCurrent: i === now.getMonth(),
      });
    }
  }

  // DEFAULT → MONTHLY
  else {
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(now.getFullYear(), now.getMonth(), i);

      points.push({
        date: day,
        label: day.toLocaleDateString("en-US", {
          day: "numeric",
        }),
        isCurrent: i === now.getDate(),
      });
    }
  }

  return points;
};
