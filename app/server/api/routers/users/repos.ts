import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import {
  getBounty,
  getOrCreateWallet,
  getPullRequest,
  getPullRequestByID,
  getRepository,
  getRepositoryByID,
  getUserById,
} from "@/prisma/helpers";
import { Octokit } from "octokit";
import axios from "axios";

export const getRepos = protectedProcedure.mutation(async ({ ctx }) => {
  let step = "token";

  try {
    const currUser = await getUserById(ctx.user.id);
    console.log("token", ctx.user.token, currUser.githubId);

    const githubTokenResponse = await axios.request({
      method: "GET",
      url: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/github|${currUser.githubId}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
      },
    });
    step = "octo";
    console.log("gh", githubTokenResponse);

    const octokit = new Octokit({
      auth: githubTokenResponse.data.identities[0].access_token,
    });

    const octokitResponse = await octokit.request("GET /user/repos", {});

    console.log("octo", octokitResponse);
    return octokitResponse.data;
  } catch (e) {
    console.error(e);
    console.log(step);
    return [];
  }
});
