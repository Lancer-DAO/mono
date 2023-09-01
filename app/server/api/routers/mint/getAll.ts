import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const getMints = protectedProcedure.query(async () => {
  return await queries.mint.getAll();
});
