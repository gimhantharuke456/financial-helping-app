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

// Ensure the API key is set in the environment variables
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "API key is missing. Please set the NEXT_PUBLIC_OPENAI_API_KEY in .env."
  );
}

// Message component for individual chat messages
interface MessageProps {
  message: { role: string; content: string };
  isUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isUser }) => (
  <div
    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}
  >
    {!isUser && (
      <Avatar className="h-8 w-8 bg-primary-foreground">
        <div className="text-xs font-bold">AI</div>
      </Avatar>
    )}
    <div
      className={`p-3 rounded-lg max-w-[80%] ${
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
      }`}
    >
      {message.content}
    </div>
    {isUser && (
      <Avatar className="h-8 w-8 bg-primary">
        <div className="text-xs font-bold text-primary-foreground">You</div>
      </Avatar>
    )}
  </div>
);

const ChatbotPage = () => {
  const [incomes, setInComes] = useState<Income[]>([]);
  const [expences, setExpences] = useState<Expense[]>([]);

  const setData = async () => {
    const [expences, incomes] = await Promise.all([
      getExpensesByUserId(localStorage.getItem("userId")!),
      getIncomesByUserId(localStorage.getItem("userId")!),
    ]);
    setInComes(incomes);
    setExpences(expences);
  };

  useEffect(() => {
    setData();
  }, []);

  const [messages, setMessages] = useState<
    { role: "assistant" | "user"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hello! I'm FinanceFusion, an AI assistant powered by OpenAI's o1-mini model. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    type Message = { role: "assistant" | "user"; content: string };
    const userMessage: Message = { role: "user", content: input };
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
                        Expenses: ${JSON.stringify(expences)}.
                        Answer the user's questions related to their finances.`,
              },
            ],
            temperature: 1,
            max_tokens: 1000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message;

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error processing your request. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Chat with FinanceFusion</CardTitle>
          </CardHeader>

          <CardContent className="flex-grow p-0 relative">
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
                  <Avatar className="h-8 w-8 mr-3 bg-primary-foreground">
                    <div className="text-xs font-bold">AI</div>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>

          <CardFooter className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
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
    </section>
  );
};

export default ChatbotPage;
