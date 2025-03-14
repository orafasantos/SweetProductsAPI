import { FastifyInstance } from "fastify";
import { register, login } from "../controllers/auth.controller";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/register", {
    schema: {
      body: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 3 },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
      },
    },
    handler: register,
  });

  fastify.post("/login", {
    schema: {
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
        },
      },
    },
    handler: login,
  });
}
