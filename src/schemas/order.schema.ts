import { z } from "zod";

// Schema para validação de itens do pedido
const orderItemSchema = z.object({
  itemId: z.string().uuid({ message: "ID do item inválido" }),
  quantity: z
    .number()
    .int()
    .positive({ message: "Quantidade deve ser um número positivo" }),
});

// Schema para criação de pedido
export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .nonempty({ message: "O pedido deve conter pelo menos um item" }),
});

// Schema para atualização de status do pedido - usando valores literais
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"], {
    errorMap: () => ({ message: "Status inválido" }),
  }),
});

// Tipos inferidos dos schemas
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
