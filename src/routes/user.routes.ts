import { FastifyInstance } from "fastify";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import {
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";

export default async function userRoutes(fastify: FastifyInstance) {
  // Rota para obter o usuário atual (protegida)
  fastify.get("/me", {
    preHandler: [authenticate],
    handler: getCurrentUser,
  });

  // Rotas para administração de usuários (apenas admin)
  fastify.get("/", {
    preHandler: [authenticate, isAdmin],
    handler: getAllUsers,
  });

  fastify.get("/:id", {
    preHandler: [authenticate, isAdmin],
    handler: getUserById,
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
