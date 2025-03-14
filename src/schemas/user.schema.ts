import { z } from "zod";

// Schema para validação de registro de usuário
export const userSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

// Schema para validação de login
export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha é obrigatória" }),
});

// Tipos inferidos dos schemas
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
