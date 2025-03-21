"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { deleteUser, updateUser, getUserById } from "@/services/user.service";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

// Validation schema
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  contactNumber: z.string().optional(),
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

  // Form setup with validation
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

  // Fetch user data
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-blue-50"
    >
      <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Your Profile</h1>

        {isLoadingProfile ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading your profile...</span>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First column */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="New Password (leave empty to keep current)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Second column */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border rounded"
                            {...field}
                          >
                            <option value="Government Employee">
                              Government Employee
                            </option>
                            <option value="Private Employee">
                              Private Employee
                            </option>
                            <option value="Self Employee">Self Employee</option>
                            <option value="Other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incomeSources"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Income Sources</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="financialGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Goals</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <Button
                  type="submit"
                  disabled={isUpdating || isDeleting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isUpdating ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Updating...
                    </div>
                  ) : (
                    "Update Profile"
                  )}
                </Button>

                <Button
                  onClick={handleDelete}
                  disabled={isUpdating || isDeleting}
                  variant="destructive"
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Deleting...
                    </div>
                  ) : (
                    "Delete Account"
                  )}
                </Button>

                <Button
                  onClick={handleLogout}
                  disabled={isUpdating || isDeleting}
                  variant="outline"
                >
                  Logout
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </motion.div>
  );
};

// Tag Input Component
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
      />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="p-1 hover:bg-gray-100 rounded-full"
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
