import { getOrCreateChain } from "@/prisma/helpers";
import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const createTransaction = async (
  timestamp: string,
  signature: string,
  label: string,
  wallet: Prisma.Wallet,
  chain: Prisma.Chain,
  escrow: Prisma.Escrow
): Promise<Prisma.Transaction> => {
    const transaction = await prisma.transaction.create({
        data: {
          timestamp,
          signature,
          label,
          chain: {
            connect: {
                uuid: chain.uuid
            }
          },
          escrow: {
            connect: {
                uuid: escrow.uuid
            }
          },
          wallets: {connect: {
            walletUuid: wallet.uuid
          }}
        }
      })
  return transaction;
};
