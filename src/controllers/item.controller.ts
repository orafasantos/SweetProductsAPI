import { FastifyReply, FastifyRequest } from "fastify";
import { ItemInput } from "../schemas/item.schema";
import prisma from "../models/index";

/**
 * Listar todos os itens disponíveis
 */
export async function getAllItems(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Use type assertion para resolver o problema de tipagem
    const query = request.query as any;
    const filterByAvailable = query.available === "true";

    const items = await prisma.item.findMany({
      where: {
        ...(filterByAvailable ? { available: true } : {}),
      },
    });

    return reply.send(items);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Obter um item pelo ID
 */
export async function getItemById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return reply.status(404).send({ message: "Item não encontrado" });
    }

    return reply.send(item);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Criar um novo item (admin)
 */
export async function createItem(
  request: FastifyRequest<{ Body: ItemInput }>,
  reply: FastifyReply
) {
  try {
    const { name, description, price, available } = request.body;

    const item = await prisma.item.create({
      data: {
        name,
        description,
        price,
        available,
      },
    });

    return reply.status(201).send(item);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Atualizar um item (admin)
 */
export async function updateItem(
  request: FastifyRequest<{
    Params: { id: string };
    Body: ItemInput;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { name, description, price, available } = request.body;

    // Verificar se o item existe
    const itemExists = await prisma.item.findUnique({
      where: { id },
    });

    if (!itemExists) {
      return reply.status(404).send({ message: "Item não encontrado" });
    }

    // Atualizar item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        price,
        available,
      },
    });

    return reply.send(updatedItem);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Excluir um item (admin)
 */
export async function deleteItem(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;

    // Verificar se o item existe
    const itemExists = await prisma.item.findUnique({
      where: { id },
    });

    if (!itemExists) {
      return reply.status(404).send({ message: "Item não encontrado" });
    }

    // Verificar se o item está sendo usado em algum pedido
    const orderItemCount = await prisma.orderItem.count({
      where: { itemId: id },
    });

    if (orderItemCount > 0) {
      // Em vez de excluir, apenas marcar como indisponível
      await prisma.item.update({
        where: { id },
        data: { available: false },
      });

      return reply.send({
        message:
          "Item marcado como indisponível pois está associado a pedidos existentes",
      });
    }

    // Excluir item se não estiver em uso
    await prisma.item.delete({
      where: { id },
    });

    return reply.status(204).send();
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}
