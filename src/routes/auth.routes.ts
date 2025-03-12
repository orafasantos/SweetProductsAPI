import { FastifyInstance } from "fastify";
import { loginSchema, userSchema } from "../schemas/user.schema";

// Controllers that will be implemented

import { register, login } from "../controllers/auth.controller";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", {
    schema: {
      body: userSchema,
    },
    handler: register,
  });

  fastify.post("/login", {
    schema: {
      body: loginSchema,
    },
    handler: login,
  });
}
