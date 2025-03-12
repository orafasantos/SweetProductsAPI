import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginInput, UserInput } from "../schemas/user.schema";
import prisma from "../models/index";

/**
 * Controller para registro de usuários
 */
export async function register(
  request: FastifyRequest<{ Body: UserInput }>,
  reply: FastifyReply
) {
  try {
    const { name, email, password } = request.body;

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
}

/**
 * Controller para login de usuários
 */
export async function login(
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  try {
    const { email, password } = request.body;

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

    // Gerar token JWT usando o Fastify JWT
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
}
