import { FastifyInstance } from "fastify";
import { authenticate, isAdmin } from "../middleware/auth.middleware";

// Controllers that will be here

import {
  getCurrentUser,
  getAllUsers,
  getUSerById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

export default async function userRoutes(fastify: FastifyInstance) {
  // Route to get current user (protected)
  fastify.get("/me", {
    preHandler: [authenticate],
    handler: getCurrentUser,
  });

  // Route to user administration (admin only)

  fastify.get("/", {
    preHandler: [authenticate, isAdmin],
    handler: getAllUsers,
  });

  fastify.get("/:id", {
    preHandler: [authenticate, isAdmin],
    handler: getUSerById,
  });

  fastify.put("/:id", {
    preHandler: [authenticate, isAdmin],
    handler: updateUser,
  });

  fastify.delete("/:id", {
    preHandler: [authenticate, isAdmin],
    handler: deleteUser,
  });
}
