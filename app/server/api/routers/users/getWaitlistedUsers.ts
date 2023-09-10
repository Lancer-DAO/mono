
import * as queries from "@/prisma/queries";
import { protectedProcedure } from "../../trpc";

export const getWaitlistedUsers = protectedProcedure
  .query(async () => {
    const users = await queries.user.getWaitlistedUsers();

    return users;
  });