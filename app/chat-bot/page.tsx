"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { getExpensesByUserId } from "@/services/expense.service";
import { getIncomesByUserId } from "@/services/income.service";
import { Expense, Income } from "@prisma/client";
import Navbar from "@/components/Navbar";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "API key is missing. Please set the NEXT_PUBLIC_OPENAI_API_KEY in .env."
  );
}

interface MessageProps {
  message: { role: string; content: string };
  isUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isUser }) => (
  <div
    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}
  >
    {!isUser && (
      <Avatar className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="text-xs font-bold text-white">AI</div>
      </Avatar>
    )}
    <div
      className={`p-3 rounded-lg max-w-[80%] ${
        isUser
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          : "bg-gray-700 text-gray-100"
      }`}
    >
      {message.content}
    </div>
    {isUser && (
      <Avatar className="h-8 w-8 bg-gray-600">
        <div className="text-xs font-bold text-white">You</div>
      </Avatar>
    )}
  </div>
);

const ChatbotPage = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [messages, setMessages] = useState<
    { role: "assistant" | "user"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hello! I'm FinanceFusion, an AI assistant powered by OpenAI. How can I help you with your finances today?",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const setData = async () => {
    const [expenses, incomes] = await Promise.all([
      getExpensesByUserId(localStorage.getItem("userId")!),
      getIncomesByUserId(localStorage.getItem("userId")!),
    ]);
    setIncomes(incomes);
    setExpenses(expenses);
  };

  useEffect(() => {
    setData();
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              ...messages,
              userMessage,
              {
                role: "system",
                content: `You are a financial assistant. Here is the user's financial data: 
                        Incomes: ${JSON.stringify(incomes)}, 
                        Expenses: ${JSON.stringify(expenses)}.
                        Answer the user's questions related to their finances.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`API request failed with status ${response.status}`);

      const data = await response.json();
      setMessages((prev) => [...prev, data.choices[0].message]);
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbar />
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-2xl bg-gray-800 border-gray-700 shadow-xl">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-xl text-white">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                FinanceFusion AI
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 h-[500px]">
            <ScrollArea className="h-full p-4">
              {messages.map((message, index) => (
                <Message
                  key={index}
                  message={message}
                  isUser={message.role === "user"}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <Avatar className="h-8 w-8 mr-3 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="text-xs font-bold text-white">AI</div>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-gray-700">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-grow bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
