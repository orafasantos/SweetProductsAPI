import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import jwt from "fastify/jwt";
import { join } from "path";

// Routes import

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import itemRoutes from "./routes/item.routes";
import orderRoutes from "./routes/order.routes";

const server: FastifyInstance = Fastify({
  logger: true,
});

async function app() {
  try {
    await server.register(cors, {
      origin: true, // Em Produçao definir os dominios permitidos
    });

    await server.register(jwt, {
      secret: process.env.JWT_SECRET || "supermegasenha",
    });

    server.register(authRoutes, { prefix: "/api/auth" });
    server.register(userRoutes, { prefix: "/api/users" });
    server.register(itemRoutes, { prefix: "/api/items" });
    server.register(orderRoutes, { prefix: "/api/orders" });

    server.get("/health", async () => {
      return { status: "ok" };
    });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const host = process.env.HOST || "0.0.0.0";

    await server.listen({ port, host });
    console.log(`Servidor rodando em https://${host}:${port}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

app();
