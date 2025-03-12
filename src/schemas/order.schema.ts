import { z } from "zod";
import { OrderStatus } from "@prisma/client";

// Schema for item inside the order
const orderItemSchema = z.object({
  itemId: z.string().uuid({ message: "ID do item inválido" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantidade deve ser um número positivo" }),
});

// Schema for order creation
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .nonempty({ message: "O pedido deve conter pelo menos um item" }),
});

// Schema for update order status
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: "Status inválido" }),
  }),
});

// Type of schemas
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
