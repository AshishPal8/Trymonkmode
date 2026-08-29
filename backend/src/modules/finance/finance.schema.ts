import { z } from "zod";

export const createTransactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  amount: z.number().positive("Amount must be greater than zero"),
  type: z.enum(["income", "expense"]).default("expense"),
  category: z.string().default("General"),
  paymentMethod: z.string().default("Apple Pay"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  time: z.string().default("12:00 PM"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
