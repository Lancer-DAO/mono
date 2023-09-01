
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
      const fileKey = fileUrl.split('/f/')[1];

      await utapi.deleteFiles(decodeURI(fileKey));

      return { success: "true" };
    }
  );

