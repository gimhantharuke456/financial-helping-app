"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if userId exists in localStorage
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white bg-opacity-90 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 flex items-center"
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  FinanceFusion
                </span>
              </motion.div>
            </div>

            <div className="flex items-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex space-x-4"
              >
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/expenses"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Expenses
                    </Link>
                    <Link
                      href="/income"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Income
                    </Link>
                    <Link
                      href="/profile"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              FinanceFusion
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Text and Voice-Enabled Expense and Income Management with Smart
            Analytics
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="bg-white bg-opacity-80 backdrop-blur rounded-xl shadow-xl p-6 md:p-8 mb-12 max-w-3xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Financial Health Predictor
              </h2>
              <p className="text-gray-600">
                Our advanced machine learning system predicts your financial
                health over the next 6-12 months based on your spending
                patterns, income, and savings.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all">
              Get Started for Free
            </button>
            <button className="px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all">
              Learn More
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Expense Tracking
            </h3>
            <p className="text-gray-600">
              Add, update, and delete expenses with ease. Our system validates
              all data entries and checks for duplicates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Income Management
            </h3>
            <p className="text-gray-600">
              Track all your income sources in one place. Generate monthly
              reports and source-wise breakdowns.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Smart Analytics
            </h3>
            <p className="text-gray-600">
              Get personalized insights and automated categorization of
              transactions for better financial planning.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
