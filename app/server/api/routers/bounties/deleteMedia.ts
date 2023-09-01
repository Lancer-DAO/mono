import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { utapi } from "uploadthing/server"

export const deleteMedia = protectedProcedure
  .input(
    z.object({
      imageUrl: z.string()
    })
  )
  .mutation(
    async ({ input: { imageUrl } }) => {
      const fileKey = imageUrl.split('/f/')[1];

      await utapi.deleteFiles(decodeURI(fileKey));

      return { success: "true" };
    }
  );

