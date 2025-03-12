import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "../schemas/order.schema";
import prisma from "../models/index";
import { OrderStatus } from "@prisma/client";

/**
 * Criar um novo pedido
 */
export async function createOrder(
  request: FastifyRequest<{ Body: CreateOrderInput }>,
  reply: FastifyReply
) {
  try {
    const { items } = request.body;
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ message: "Não autenticado" });
    }

    // Validar itens e calcular total
    const itemIds = items.map((item) => item.itemId);

    // Buscar os itens do banco para validar existência e obter preços
    const existingItems = await prisma.item.findMany({
      where: {
        id: { in: itemIds },
        available: true,
      },
    });

    // Verificar se todos os itens existem e estão disponíveis
    if (existingItems.length !== itemIds.length) {
      return reply.status(400).send({
        message: "Um ou mais itens não existem ou não estão disponíveis",
      });
    }

    // Criar um mapa de itens para acesso fácil pelo ID
    const itemMap = existingItems.reduce((map, item) => {
      map[item.id] = item;
      return map;
    }, {} as Record<string, (typeof existingItems)[0]>);

    // Calcular o total do pedido
    let total = 0;
    const orderItems = items.map((item) => {
      const dbItem = itemMap[item.itemId];
      const itemTotal = dbItem.price * item.quantity;
      total += itemTotal;

      return {
        itemId: item.itemId,
        quantity: item.quantity,
        price: dbItem.price, // Guarda o preço atual do item
      };
    });

    // Criar o pedido com os itens
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    return reply.status(201).send(order);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Obter todos os pedidos do usuário atual
 */
export async function getUserOrders(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ message: "Não autenticado" });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reply.send(orders);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Obter um pedido específico pelo ID
 */
export async function getOrderById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const userId = request.user?.id;
    const isAdmin = request.user?.role === "ADMIN";

    if (!userId) {
      return reply.status(401).send({ message: "Não autenticado" });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return reply.status(404).send({ message: "Pedido não encontrado" });
    }

    // Verificar se o usuário tem permissão para ver este pedido
    if (order.userId !== userId && !isAdmin) {
      return reply.status(403).send({ message: "Acesso negado" });
    }

    return reply.send(order);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Listar todos os pedidos (admin)
 */
export async function getAllOrders(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Opções de filtro
    const query = request.query as Record<string, string>;
    let statusFilter = undefined;

    // Converter a string para o enum OrderStatus, se for válido
    if (
      query.status &&
      Object.values(OrderStatus).includes(query.status as any)
    ) {
      statusFilter = query.status as OrderStatus;
    }

    const orders = await prisma.order.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reply.send(orders);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

/**
 * Atualizar o status de um pedido (admin)
 */
export async function updateOrderStatus(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateOrderStatusInput;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { status } = request.body;

    // Verificar se o pedido existe
    const orderExists = await prisma.order.findUnique({
      where: { id },
    });

    if (!orderExists) {
      return reply.status(404).send({ message: "Pedido não encontrado" });
    }

    // Atualizar status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return reply.send(updatedOrder);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}
