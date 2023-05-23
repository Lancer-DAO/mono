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

export const getRepos = protectedProcedure.mutation(
  async ({
    ctx: {
      user: { id },
    },
  }) => {
    try {
      const currUser = await getUserById(id);
      const auth0TokenResponse = await axios.request({
        method: "POST",
        url: `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.AUTH0_CLIENT_ID || "", //auth0 clientID
          client_secret: process.env.AUTH0_CLIENT_SECRET || "", //auth0 client secret
          audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
        }),
      });
      const auth0Token = auth0TokenResponse.data.access_token;
      const githubTokenResponse = await axios.request({
        method: "GET",
        url: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/github|${currUser.githubId}`,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${auth0Token}`,
        },
      });

      const octokit = new Octokit({
        auth: githubTokenResponse.data.identities[0].access_token,
      });

      const octokitResponse = await octokit.request("GET /user/repos", {});

      return octokitResponse.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }
);
