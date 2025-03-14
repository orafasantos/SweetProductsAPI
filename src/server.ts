import Fastify, {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import { join } from "path";

// Importação das rotas
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import itemRoutes from "./routes/item.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";

// Criação da instância do Fastify
const server: FastifyInstance = Fastify({
  logger: true,
});

// Função para iniciar o servidor
async function app() {
  try {
    // Registrar plugins
    await server.register(cors, {
      origin: true, // Em produção, defina os domínios permitidos
    });

    await server.register(fjwt, {
      secret: process.env.JWT_SECRET || "sua_chave_secreta",
    });

    // Definindo decoradores para o token
    server.decorate(
      "authenticate",
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.status(401).send({ message: "Não autorizado" });
        }
      }
    );

    // Registrar rotas
    server.register(authRoutes, { prefix: "/api/auth" });
    server.register(userRoutes, { prefix: "/api/users" });
    server.register(itemRoutes, { prefix: "/api/items" });
    server.register(orderRoutes, { prefix: "/api/orders" });
    server.register(adminRoutes, { prefix: "/api/admin" });

    // Rota de healthcheck
    server.get("/health", async () => {
      return { status: "ok" };
    });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || "0.0.0.0";

    await server.listen({ port, host });
    console.log(`Servidor rodando em http://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

// Iniciar o servidor
app();
