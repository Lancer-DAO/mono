import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const getAllIndustries = protectedProcedure.mutation(async () => {
  return await queries.industry.getMany();
});
