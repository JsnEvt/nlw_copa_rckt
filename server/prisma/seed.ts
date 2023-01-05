import {PrismaClient} from '@prisma/client'
import { getPrismaClient } from '@prisma/client/runtime'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Denis La Rochefocauld',
      email: 'denislr@email.com',
      avatarUrl: 'https://teste.com/foto.png',
    }
  })
  
  const pool = await prisma.pool.create({
    data:{
      title: 'Example pool',
      code: 'BOLAO123',
      ownerId: user.id,
      
      //criando com insercoes encadeadas .... recurso do prisma
      Participants:{
        create: {
          userId: user.id
        }
      }
    }
  })

  //criando na condicao normal
  // const participants = await prisma.participant.create({
  //   data:{
  //     poolId: pool.id,
  //     userId: user.id,
  //   }
  // })

  await prisma.game.create({
    data:{
      data:'2022-11-02T12:55:18.570Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'BR',
    }
  })

  await prisma.game.create({
    data:{
      data:'2022-11-03T12:55:18.570Z',
      firstTeamCountryCode: 'BR',
      secondTeamCountryCode: 'AR',

      guesses:{
        create:{
          firstTeamPoints: 2,
          secondTeamPoints: 1,

          participant:{
            connect:{
              userId_poolId:{
                userId: user.id,
                poolId: pool.id,
              }
            }
          }
        }
      }
    }
  })

  
}

main()