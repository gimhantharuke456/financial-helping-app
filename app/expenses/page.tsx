"use client";
import { ExpenseList } from "@/components/expences/ExpenseList";
import Navbar from "@/components/Navbar";
import { getExpensesByUserId } from "@/services/expense.service";
import { Expense } from "@prisma/client";
import React, { useEffect, useState, useMemo } from "react";

const ExpensesPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses when userId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Reset states for new fetch
        setIsLoading(true);
        setError(null);

        // Get userId from localStorage
        const storedUserId = localStorage.getItem("userId");

        if (!storedUserId) {
          setIsLoading(false);
          setError("User ID not found. Please log in again.");
          return;
        }

        setUserId(storedUserId);

        // Fetch expenses
        const fetchedExpenses = await getExpensesByUserId(storedUserId);
        setExpenses(fetchedExpenses);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
        setError("Failed to load expenses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize expenses to prevent unnecessary re-renders of ExpenseList
  const memoizedExpenses = useMemo(() => expenses, [expenses]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !userId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4 max-w-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error || "User ID not found. Please log in again."}</p>
            </div>
            <button
              onClick={() => (window.location.href = "/login")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 p-4 md:p-8 lg:p-16">
        <h1 className="text-2xl font-bold mb-6">My Expenses</h1>
        <ExpenseList initialExpenses={memoizedExpenses} userId={userId} />
      </div>
    </div>
  );
};

export default ExpensesPage;
