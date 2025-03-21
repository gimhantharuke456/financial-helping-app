const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Create a new expense
export const createExpense = async (expenseData: {
  amount: number;
  category: string;
  date: Date;
  reason?: string;
  userId: string;
}) => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
};

// Get all expenses for a user
export const getExpensesByUserId = async (userId: string) => {
  const response = await fetch(`${API_URL}/expenses?userId=${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return response.json();
};

// Update an expense
export const updateExpense = async (
  id: string,
  expenseData: {
    amount?: number;
    category?: string;
    date?: Date;
    reason?: string;
  }
) => {
  const response = await fetch(`${API_URL}/expenses?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    throw new Error("Failed to update expense");
  }

  return response.json();
};

// Delete an expense
export const deleteExpense = async (id: string) => {
  const response = await fetch(`${API_URL}/expenses?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }

  return response.json();
};
