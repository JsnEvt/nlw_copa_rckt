import { join } from '@prisma/client/runtime'
import { FastifyInstance } from 'fastify'
import ShortUniqueId from 'short-unique-id'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'


export async function poolRoutes(fastify: FastifyInstance) {

  fastify.get('/pools/count', async () => {
    const countPools = await prisma.pool.count()
    return countPools
  })

  fastify.post('/pools', async (req, res) => {
    const createPoolBody = z.object({
      title: z.string(),
    })

    const { title } = createPoolBody.parse(req.body)

    const generate = new ShortUniqueId({ length: 6 })
    const code = String(generate()).toUpperCase()

    try {
      await req.jwtVerify()
      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: req.user.sub,

          Participants: {
            create: {
              userId: req.user.sub,
            }
          }
        }
      })

    } catch {
      await prisma.pool.create({
        data: {
          title,
          code,
        }
      })

    }

    return res.status(201).send({ code, title })
  })

  fastify.post('/pools/join', {
    onRequest: [authenticate]
  }, async (req, res) => {
    const joinPoolBody = z.object({
      code: z.string(),
    })
    const { code } = joinPoolBody.parse(req.body)

    const pool = await prisma.pool.findUnique({
      where: {
        code,
      },
      include: {
        Participants: {
          where: {
            userId: req.user.sub
          }
        }
      }
    })
    if (!pool) {
      return res.status(400).send({
        message: 'Pool not found.'
      })
    }

    if (pool.Participants.length > 0) {
      return res.status(400).send({
        message: 'You already joined this pool.'
      })
    }

    if (!pool.ownerId) {
      await prisma.pool.update({
        where: {
          id: pool.id,
        },
        data: {
          ownerId: req.user.sub,
        }
      })
    }

    await prisma.participant.create({
      data: {
        poolId: pool.id,
        userId: req.user.sub,
      }
    })
    return res.status(201).send()
  })

  fastify.get('/pools', {
    onRequest: [authenticate]
  }, async (req) => {
    const pools = await prisma.pool.findMany({
      where: {
        Participants: {
          some: {
            userId: req.user.sub,
          }
        }
      },
      include: {
        _count: {
          select: {
            Participants: true,
          }
        },

        Participants: {
          select: {
            id: true,

            User: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4,
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        },
      }
    })

    return { pools }
  })

  fastify.get('/pools/:poolId', {
    onRequest: [authenticate],
  }, async (request, reply) => {
    const getPoolParams = z.object({
      poolId: z.string(),
    })

    const { poolId } = getPoolParams.parse(request.params)

    const pool = await prisma.pool.findFirst({
      where: {
        id: poolId,
      },
      include: {
        _count: {
          select: {
            Participants: true,
          }
        },

        Participants: {
          select: {
            id: true,

            User: {
              select: {
                avatarUrl: true,
              }
            }
          },
          take: 4,
        },
        owner: {
          select: {
            id: true,
            name: true
          }
        },
      }
    })

    return { pool }
  })


}

