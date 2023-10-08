import { prisma } from "@/server/db";
import { UnwrapPromise } from "@/types";
import * as Prisma from "@prisma/client";

const walletQuery = async (publicKey: string) =>
  prisma.wallet.findUnique({
    where: {
      publicKey,
    },
  });

export const getOrCreate = async (
  user: Prisma.User,
  publicKey: string,
  hasProfileNFT?: boolean
): Promise<Prisma.Wallet> => {
  let wallet = await walletQuery(publicKey);
  if (wallet && user.id !== wallet.userid) {
    const error = {
      code: 403,
      message: "Wallet is registered to another user",
    };
    throw error;
  }
  if (!wallet) {
    try {
      await prisma.wallet.create({
        data: {
          publicKey,
          userid: user.id,
          hasProfileNFT,
        },
      });
      wallet = await walletQuery(publicKey);
    } catch (e) {
      console.error(e);
    }
  }
  return wallet;
};

export type WalletType = UnwrapPromise<ReturnType<typeof walletQuery>>;
