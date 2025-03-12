import { FastifyInstance } from "fastify";
import { loginSchema, userSchema } from "../schemas/user.schema";
import { register, login } from "../controllers/auth.controller";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", {
    handler: register,
  });

  fastify.post("/login", {
    handler: login,
  });
}
