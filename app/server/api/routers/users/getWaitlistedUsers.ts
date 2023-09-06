
import * as queries from "@/prisma/queries";
import { protectedProcedure } from "../../trpc";

export const getWaitlistedUsers = protectedProcedure
  .query(async () => {
    const user = await queries.user.getWaitlistedUsers();

    return user;
  });