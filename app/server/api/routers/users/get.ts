import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";
import { UnwrapPromise } from "@/types";

export const getUser = protectedProcedure
  .input(
    z.object({
      id: z.number(),
    })
  )
  .query(async ({ input: { id } }) => {
    const user = await queries.user.getById(id);

    return user;
  });

export type User = UnwrapPromise<ReturnType<typeof getUser>>;
