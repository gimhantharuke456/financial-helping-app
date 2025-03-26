"use client";
import { ExpenseList } from "@/components/expences/ExpenseList";
import ExpencesChartContainer from "@/components/ExpencesChartContainer";
import Navbar from "@/components/Navbar";
import { getExpensesByUserId } from "@/services/expense.service";
import { Expense } from "@prisma/client";
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

const ExpensesPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "chart">("list");

  // Fetch expenses when userId changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedUserId = localStorage.getItem("userId");
        if (!storedUserId) {
          setIsLoading(false);
          setError("User ID not found. Please log in again.");
          return;
        }

        setUserId(storedUserId);
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

  // Memoize expenses to prevent unnecessary re-renders
  const memoizedExpenses = useMemo(() => expenses, [expenses]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading expenses...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md p-6 bg-gray-800 rounded-xl shadow-xl"
          >
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg">
              <p>{error || "User ID not found. Please log in again."}</p>
            </div>
            <button
              onClick={() => (window.location.href = "/login")}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Go to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <Navbar />
      <div className="container mx-auto p-4 md:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              My Expenses
            </span>
          </h1>
          <p className="text-gray-400">Track and analyze your spending</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex mb-6 border-b border-gray-700"
        >
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 font-medium text-sm md:text-base ${
              activeTab === "list"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Expense List
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`px-4 py-2 font-medium text-sm md:text-base ${
              activeTab === "chart"
                ? "text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Analytics
          </button>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-4 md:p-6"
        >
          {activeTab === "list" ? (
            <ExpenseList initialExpenses={memoizedExpenses} userId={userId} />
          ) : (
            <ExpencesChartContainer initialExpenses={memoizedExpenses} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExpensesPage;
