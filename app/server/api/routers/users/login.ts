import { protectedProcedure } from "../../trpc";
import * as queries from "@/prisma/queries";

export const login = protectedProcedure.mutation(async ({ ctx }) => {
  const { email, id, sub, nickname, picture } = ctx.user;
  if (!id) {
    try {
      const maybeUser = await queries.user.getByEmail(email);
      if (maybeUser) {
        return maybeUser;
      }
    } catch (e) {
      console.error(e);

      await queries.user.create(email, sub, nickname, picture);
      const user = await queries.user.getByEmail(email);
      return user;
    }
  } else {
    try {
      let user = await queries.user.getByEmail(email);
      if (!user.picture) {
        await queries.user.updatePicture(user.id, picture);
        user = await queries.user.getByEmail(email);
      }
      if (!user.name) {
        await queries.user.updateName(user.id, nickname);
        user = await queries.user.getByEmail(email);
      }
      return user;
    } catch (e) {
      console.error("❌", e);
    }
  }
});
