import Fastify from "fastify";
import cors from "@fastify/cors";
import fjwt from "@fastify/jwt";
import prisma from "./models/index";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

// Criação da instância do Fastify
const server = Fastify({
  logger: true,
});

// Função para iniciar o servidor
async function app() {
  try {
    // Registrar plugins
    await server.register(cors, {
      origin: true,
    });

    await server.register(fjwt, {
      secret: process.env.JWT_SECRET || "sua_chave_secreta",
    });

    // Middleware de autenticação simples
    server.decorate("authenticate", async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ message: "Não autorizado" });
      }
    });

    // Rotas básicas para testar

    // Health check
    server.get("/health", async () => {
      return { status: "ok" };
    });

    // Registro de usuário
    server.post("/api/auth/register", async (request, reply) => {
      try {
        const body = request.body as any;
        const { name, email, password } = body;

        // Validar dados
        if (!name || !email || !password) {
          return reply.status(400).send({ message: "Dados incompletos" });
        }

        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return reply.status(400).send({ message: "Email já cadastrado" });
        }

        // Criptografar senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        });

        return reply.status(201).send(user);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    });

    // Login
    server.post("/api/auth/login", async (request, reply) => {
      try {
        const body = request.body as any;
        const { email, password } = body;

        // Validar dados
        if (!email || !password) {
          return reply.status(400).send({ message: "Dados incompletos" });
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return reply.status(401).send({ message: "Credenciais inválidas" });
        }

        // Verificar senha
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return reply.status(401).send({ message: "Credenciais inválidas" });
        }

        // Gerar token JWT
        const token = await reply.jwtSign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          { expiresIn: "1d" }
        );

        return reply.send({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    });

    // Listar itens
    server.get("/api/items", async (request, reply) => {
      try {
        const items = await prisma.item.findMany();
        return reply.send(items);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: "Erro interno do servidor" });
      }
    });

    // Criar item (somente admin)
    server.post("/api/items", {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
          const user = request.user as any;
          if (user.role !== Role.ADMIN) {
            return reply.status(403).send({ message: "Acesso negado" });
          }
        } catch (err) {
          return reply.status(401).send({ message: "Não autorizado" });
        }
      },
      handler: async (request, reply) => {
        try {
          const body = request.body as any;
          const { name, description, price, available } = body;

          // Validar dados
          if (!name || price === undefined) {
            return reply.status(400).send({ message: "Dados incompletos" });
          }

          // Criar item
          const item = await prisma.item.create({
            data: {
              name,
              description: description || null,
              price: Number(price),
              available: available !== undefined ? Boolean(available) : true,
            },
          });

          return reply.status(201).send(item);
        } catch (error) {
          console.error(error);
          return reply
            .status(500)
            .send({ message: "Erro interno do servidor" });
        }
      },
    });

    // Obter usuário atual
    server.get("/api/users/me", {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          return reply.status(401).send({ message: "Não autorizado" });
        }
      },
      handler: async (request, reply) => {
        try {
          const user = request.user as any;
          const userId = user.id;

          const userInfo = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          });

          if (!userInfo) {
            return reply
              .status(404)
              .send({ message: "Usuário não encontrado" });
          }

          return reply.send(userInfo);
        } catch (error) {
          console.error(error);
          return reply
            .status(500)
            .send({ message: "Erro interno do servidor" });
        }
      },
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
