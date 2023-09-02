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
      try {
        const fileKey = imageUrl.split('/f/')[1];
        await utapi.deleteFiles(decodeURI(fileKey));
      } catch (error) {
        console.error(error);
      }

      return { success: "true" };
    }
  );

