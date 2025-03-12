import { z } from "zod";

// Schema for item validation

export const itemSchema = z.object({
  name: z.string().min(3, { message: "Name must have at least 3 characters" }),
  description: z.string().optional(),
  price: z.number().positive({ message: "Price must be positive" }),
  available: z.boolean().default(true),
});

// Type of schema

export type ItemInput = z.infer<typeof itemSchema>;
