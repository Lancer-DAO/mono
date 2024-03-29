import { prisma } from "@/server/db";
import * as Prisma from "@prisma/client";

export const create = async (
  title: string,
  price: number,
  description: string,
  estimatedTime: number,
  order: number,
  quote: Prisma.Quote,
): Promise<Prisma.Checkpoint> => {
  return await prisma.checkpoint.create({
    data: {
      title,
      price,
      description,
      estimatedTime,
      order,
      quote: {
        connect: {
          id: quote.id,
        }
      }
    },
  });
}