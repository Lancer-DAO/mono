import type { NextApiRequest, NextApiResponse } from "next";
 
import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
 
const f = createUploadthing();
  
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("file url", file.url);
    }),
  pdfUploader: f({ pdf: { maxFileSize: "1MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      console.log("file url", file.url)
    }),
  imageAndVideoUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "4GB", maxFileCount: 1 },
  })
    .onUploadComplete(async ({ file }) => {
      console.log("file url", file.url)
    })
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;