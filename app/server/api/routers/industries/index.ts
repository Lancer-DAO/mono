import { createTRPCRouter } from "../../trpc";
import { getAllIndustries } from "./getAllIndustries";
import { getIndustriesByUserId } from "./getIndustriesByUserId";

export const industries = createTRPCRouter({
  getAllIndustries,
  getIndustriesByUserId,
});
