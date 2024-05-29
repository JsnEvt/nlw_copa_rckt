import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";


export async function userRoutes(fastify: FastifyInstance) {
    fastify.get('/users/count', async (request, reply) => {
        try {
            const count = await prisma.user.count();
            return reply.send({ count })
        } catch (error) {
            fastify.log.error(error)
            return reply.status(500).send({ error: 'Failed to fetch users count in the server' })
        }
    });
}

