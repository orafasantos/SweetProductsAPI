import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface AuthPayload {
  id: string;
  email: string;
  role: Role;
}

// Middleware to auth users

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ message: "Token nao fornecido" });
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      return reply.status(401).send({ message: "Token nao fornecido" });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "supermegasenha"
      ) as AuthPayload;

      request.user = decoded;
    } catch (error) {
      return reply.status(401).send({ message: "Token inválido" });
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(500)
      .send({ message: "internal server error, my fault sorry" });
  }
}

// Middleware to verify if the user is Admin

export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user || request.user.role !== "ADMIN") {
    return reply
      .status(403)
      .send({ message: "Deny access, only admins feature" });
  }
}

// Type user definition for fastify,

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthPayload;
  }
}
