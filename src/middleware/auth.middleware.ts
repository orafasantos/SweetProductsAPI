import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import "@fastify/jwt";

export interface AuthPayload {
  id: string;
  email: string;
  role: Role;
}

// Middleware para autenticar usuários
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({
      message: "Não autorizado - Token inválido ou expirado",
    });
  }
}

// Middleware para verificar se o usuário é admin
export async function isAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user || request.user.role !== "ADMIN") {
    return reply.status(403).send({
      message:
        "Acesso negado. Apenas administradores podem acessar este recurso.",
    });
  }
}

// Estender a definição do JWT payload
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthPayload;
    user: AuthPayload;
  }
}
