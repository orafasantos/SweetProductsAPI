import { FastifyInstance } from "fastify";
import { itemSchema } from "../schemas/item.schema";
import { authenticate, isAdmin } from "../middleware/auth.middleware";

// Controllers will be implemented here

import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/item.controller";

export default async function itemRoutes(fastify: FastifyInstance) {
  // Public Routes

  fastify.get("/", getAllItems);
  fastify.get("/:id", getItemById);

  // Protected Routes (adminOnly)
  fastify.post("/", {
    preHandler: [authenticate, isAdmin],
    schema: {
      body: itemSchema,
    },
    handler: createItem,
  });

  fastify.put("/:id", {
    preHandler: [authenticate, isAdmin],
    schema: {
      body: itemSchema,
    },
    handler: updateItem,
  });

  fastify.delete("/:id", {
    preHandler: [authenticate, isAdmin],
    handler: deleteItem,
  });
}
