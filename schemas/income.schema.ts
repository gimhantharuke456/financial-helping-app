import { z } from "zod";

export const incomeSchema = z.object({
  amount: z.number(),
  source: z.string(),
  date: z.string().transform((val) => new Date(val)),
  userId: z.string(),
});
