import { createTRPCRouter } from "../../trpc";
import { createMedia } from "./createMedia";
import { deleteMedia } from "./deleteMedia";
import { getMedia } from "./getMedia";
import { getMediaByUpdate } from "./getMediaByUpdate";
import { updateMedia } from "./updateMedia";
import { getMediaByBounty } from "./getMediaByBounty";

export const media = createTRPCRouter({
  getMedia,
  getMediaByBounty,
  getMediaByUpdate,
  createMedia,
  updateMedia,
  deleteMedia,
});
