import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { getMints as helper } from "@/prisma/helpers";

export const getMints = protectedProcedure.mutation(async () => {
  return await helper();
});
