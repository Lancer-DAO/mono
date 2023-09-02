import { createTRPCRouter } from "../../trpc";
import { getMedia } from "./getMedia";
import { createMedia } from "./createMedia";
import { updateMedia } from "./updateMedia";
import { deleteMedia } from "./deleteMedia";

export const media = createTRPCRouter({
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia,
});