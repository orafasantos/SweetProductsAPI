import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../models/index";

// get the current user authenticated

export async function getCurrentUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ message: "Não autenticado" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    return reply.send(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

// * List all users (adminOnly)

export async function getAllUsers(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return reply.send(users);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

//  Get user by ID (adminOnly)

export async function getUserById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    return reply.send(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

// * Update one User (adminOnly)

export async function updateUser(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { name?: string; email?: string; role?: "USER" | "ADMIN" };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { name, email, role } = request.body;

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return reply.send(updatedUser);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

// * Delete user (admin)

export async function deleteUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    // Verify if User exists
    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    // Delete User
    await prisma.user.delete({
      where: { id },
    });

    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}
