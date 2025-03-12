import { FastifyInstance } from "fastify";
import { itemSchema } from "../schemas/item.schema";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/item.controller";

export default async function itemRoutes(fastify: FastifyInstance) {
  // Rotas públicas
  fastify.get("/", getAllItems);
  fastify.get("/:id", getItemById);

  // Rotas protegidas (apenas admin)
  fastify.post("/", {
    preHandler: [authenticate, isAdmin],
    handler: createItem,
  });

  fastify.put("/:id", {
    preHandler: [authenticate, isAdmin],
    handler: updateItem,
  });

  fastify.delete("/:id", {
    preHandler: [authenticate, isAdmin],
    handler: deleteItem,
  });
}
