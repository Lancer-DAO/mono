import { createTRPCRouter } from "../../trpc";
import { getAllIndustries } from "./getAllIndustries";

export const industries = createTRPCRouter({
  getAllIndustries,
});
