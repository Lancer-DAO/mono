import { createTRPCRouter } from "../../trpc";
import { createMedia } from "./createMedia";
import { deleteMedia } from "./deleteMedia";
import { getMedia } from "./getMedia";
import { getMediaByUpdate } from "./getMediaByUpdate";
import { updateMedia } from "./updateMedia";

export const media = createTRPCRouter({
  getMedia,
  getMediaByUpdate,
  createMedia,
  updateMedia,
  deleteMedia,
});