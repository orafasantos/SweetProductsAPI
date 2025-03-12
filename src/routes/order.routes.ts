import { FastifyInstance } from "fastify";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../schemas/order.schema";
import { authenticate, isAdmin } from "../middleware/auth.middleware";

// Controllers serão implementados posteriormente
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/order.controller";

export default async function orderRoutes(fastify: FastifyInstance) {
  // Rotas para usuários autenticados
  fastify.post("/", {
    preHandler: [authenticate],
    schema: {
      body: createOrderSchema,
    },
    handler: createOrder,
  });

  fastify.get("/my-orders", {
    preHandler: [authenticate],
    handler: getUserOrders,
  });

  fastify.get("/:id", {
    preHandler: [authenticate],
    handler: getOrderById,
  });

  // Rotas para administradores
  fastify.get("/", {
    preHandler: [authenticate, isAdmin],
    handler: getAllOrders,
  });

  fastify.patch("/:id/status", {
    preHandler: [authenticate, isAdmin],
    schema: {
      body: updateOrderStatusSchema,
    },
    handler: updateOrderStatus,
  });
}
