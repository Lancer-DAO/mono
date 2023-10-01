import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as queries from "@/prisma/queries";

export const registerOnboardingBadge = protectedProcedure.mutation(
  async ({ ctx }) => {
    const {
      user: { email },
    } = ctx;
    await queries.user.registerOnboardingBadge(email);

    return;
  }
);
