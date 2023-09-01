
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { utapi } from "uploadthing/server"

export const deleteResume = protectedProcedure
  .input(
    z.object({
      fileUrl: z.string()
    })
  )
  .mutation(
    async ({ input: { fileUrl } }) => {
      try {
        const fileKey = fileUrl.split('/f/')[1];
        await utapi.deleteFiles(decodeURI(fileKey));        
      } catch (error) {
        console.error(error);
      }

      return { success: "true" };
    }
  );

