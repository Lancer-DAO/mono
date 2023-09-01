import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { utapi } from "uploadthing/server";
import * as queries from "@/prisma/queries";

export const deleteMedia = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      fileUrl: z.string(),
    })
  )
  .mutation(async ({ input: { id, fileUrl }, ctx: { user } }) => {
    const userId = user.id;
    await queries.media.deleteMedia(id, userId);

    const fileKey = fileUrl.split("/f/")[1];
    await utapi.deleteFiles(decodeURI(fileKey));

    return { success: "true" };
  });
