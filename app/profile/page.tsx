"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { deleteUser, updateUser, getUserById } from "@/services/user.service";
import { Loader2, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Enhanced validation schema with regex patterns
const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[a-zA-Z\s.]+$/, "Name can only contain letters, spaces, and dots"),

  email: z
    .string()
    .email("Invalid email address")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    ),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must contain at least one uppercase, one lowercase, one number, and one special character"
    )
    .optional(),

  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number cannot exceed 15 digits")
    .regex(/^[0-9]+$/, "Contact number can only contain numbers")
    .optional(),

  position: z.enum([
    "Government Employee",
    "Private Employee",
    "Self Employee",
    "Other",
  ]),

  incomeSources: z
    .array(z.string())
    .nonempty("At least one income source is required"),

  financialGoals: z
    .array(z.string())
    .nonempty("At least one financial goal is required"),
});

const ProfilePage = () => {
  const router = useRouter();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      contactNumber: "",
      position: "Government Employee",
      incomeSources: [],
      financialGoals: [],
    },
  });

  const generatePDF = () => {
    const userData = form.getValues();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("User Profile", 14, 20);

    const tableData = [
      ["Name", userData.name],
      ["Email", userData.email],
      ["Username", userData.username],
      ["Contact Number", userData.contactNumber || "Not Provided"],
      ["Position", userData.position],
      ["Income Sources", userData.incomeSources.join(", ")],
      ["Financial Goals", userData.financialGoals.join(", ")],
    ];

    autoTable(doc, {
      startY: 30,
      head: [["Field", "Value"]],
      body: tableData,
    });

    doc.save("user_profile.pdf");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }

      setIsLoadingProfile(true);

      try {
        const user = await getUserById(userId);
        form.reset({
          name: user.name,
          email: user.email,
          username: user.username,
          contactNumber: user.contactNumber || "",
          position: user.position,
          incomeSources: user.incomeSources || [],
          financialGoals: user.financialGoals || [],
        });
      } catch (error) {
        alert(
          error instanceof Error ? error.message : "Failed to fetch user data"
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUser();
  }, [router, form]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const handleUpdate = async (data: z.infer<typeof profileSchema>) => {
    setIsUpdating(true);
    try {
      await updateUser(localStorage.getItem("userId")!, data);
      alert("Profile updated successfully!");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(localStorage.getItem("userId")!);
      localStorage.removeItem("userId");
      alert("Account deleted successfully!");
      router.push("/register");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="w-full max-w-4xl p-8 space-y-6 bg-gray-800 rounded-xl shadow-xl backdrop-blur-sm bg-opacity-80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Your Profile
              </span>
            </h1>
            <p className="text-gray-300">Manage your account details</p>
          </motion.div>

          <Button
            onClick={generatePDF}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Printer className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>

          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-300">
                Loading your profile...
              </span>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleUpdate)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First column */}
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="john@example.com"
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="john_doe123"
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Leave empty to keep current"
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>

                  {/* Second column */}
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="1234567890"
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Position
                            </FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full p-2 bg-gray-700 border-gray-600 text-white rounded focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="Government Employee">
                                  Government Employee
                                </option>
                                <option value="Private Employee">
                                  Private Employee
                                </option>
                                <option value="Self Employee">
                                  Self Employee
                                </option>
                                <option value="Other">Other</option>
                              </select>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="incomeSources"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Income Sources
                            </FormLabel>
                            <FormControl>
                              <TagInput
                                tags={field.value}
                                onAdd={(tag) =>
                                  field.onChange([...field.value, tag])
                                }
                                onRemove={(tag) =>
                                  field.onChange(
                                    field.value.filter((t) => t !== tag)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="financialGoals"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Financial Goals
                            </FormLabel>
                            <FormControl>
                              <TagInput
                                tags={field.value}
                                onAdd={(tag) =>
                                  field.onChange([...field.value, tag])
                                }
                                onRemove={(tag) =>
                                  field.onChange(
                                    field.value.filter((t) => t !== tag)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex-1"
                  >
                    <Button
                      type="submit"
                      disabled={isUpdating || isDeleting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-md transition-all"
                    >
                      {isUpdating ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Updating...
                        </div>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleDelete}
                      disabled={isUpdating || isDeleting}
                      variant="destructive"
                      className="w-full"
                    >
                      {isDeleting ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Deleting...
                        </div>
                      ) : (
                        "Delete Account"
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleLogout}
                      disabled={isUpdating || isDeleting}
                      variant="outline"
                      className="w-full text-white border-gray-600 hover:bg-gray-700"
                    >
                      Logout
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Tag Input Component (preserved from original)
const TagInput = ({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Type and press Enter to add"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddTag}
        className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="bg-gray-700 text-gray-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-1 p-0.5 hover:bg-gray-600 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
