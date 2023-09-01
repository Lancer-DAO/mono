
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
  .mutation(
    async ({ input: { id, fileUrl } }) => {
      try {
        const fileKey = fileUrl.split('/f/')[1];
        await utapi.deleteFiles(decodeURI(fileKey));
      } catch (error) {
        console.error(error);
      }

      try {
        await queries.media.deleteMedia(id);
      } catch (error) {
        console.error(error);
      }

      return { success: "true" };
    }
  );

