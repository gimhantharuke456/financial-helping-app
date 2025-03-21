import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.number(),
  category: z.string(),
  date: z.string().transform((val) => new Date(val)),
  reason: z.string().optional(),
  userId: z.string(),
});
