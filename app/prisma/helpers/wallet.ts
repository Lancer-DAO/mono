import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const getOrCreateWallet = async (user: Prisma.User, publicKey: string, provider: string): Promise<Prisma.Wallet> => {
      let wallet = await prisma.wallet.findUnique({
        where: {
          publicKey
        },
      });
      if(!wallet) {
        wallet = await prisma.wallet.create({data:
          {
            publicKey,
            userUuid: user.uuid,
            providers: [provider]
        }})
      } else if (!wallet.providers.includes(provider)) {
        wallet = await prisma.wallet.update({
                data: {
                    providers: [...wallet.providers, provider]
                    },
                where: {
                    uuid: wallet.uuid
            }})
      }
      return wallet;
  };
