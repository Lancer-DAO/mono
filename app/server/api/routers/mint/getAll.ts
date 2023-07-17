import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const getMints = protectedProcedure.mutation(async () => {
  return await queries.mint.getAll();
});
