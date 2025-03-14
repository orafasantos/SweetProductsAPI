import { FastifyInstance } from "fastify";
import { authenticate, isAdmin } from "../middleware/auth.middleware";
import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../models/index";

// Controller para estatísticas do admin
async function getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Total de usuários
    const usersCount = await prisma.user.count();

    // Total de produtos
    const productsCount = await prisma.item.count();

    // Total de pedidos
    const ordersCount = await prisma.order.count();

    // Receita total
    const revenue = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    // Pedidos por status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Produtos mais vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ["itemId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Buscar detalhes dos produtos mais vendidos
    const topProductsDetails = await Promise.all(
      topProducts.map(async (product) => {
        const item = await prisma.item.findUnique({
          where: { id: product.itemId },
        });
        return {
          id: item.id,
          name: item.name,
          quantity: product._sum.quantity,
        };
      })
    );

    return reply.send({
      usersCount,
      productsCount,
      ordersCount,
      revenue: revenue._sum.total || 0,
      ordersByStatus,
      topProducts: topProductsDetails,
    });
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Erro interno do servidor" });
  }
}

export default async function adminRoutes(fastify: FastifyInstance) {
  // Todas as rotas admin requerem autenticação e privilégios de admin
  fastify.addHook("preHandler", authenticate);
  fastify.addHook("preHandler", isAdmin);

  // Estatísticas do dashboard
  fastify.get("/dashboard", getDashboardStats);
}
