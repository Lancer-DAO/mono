import { prisma } from "@/server/db";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import * as helpers from "@/prisma/helpers";
import { getUserById } from "@/prisma/helpers";
import { Octokit } from "octokit";
import axios from "axios";

export const createIssue = protectedProcedure
  .input(
    z.object({
      newIssue: z.boolean(),
      number: z.optional(z.number()),
      description: z.string(),
      title: z.string(),
      organizationName: z.string(),
      repositoryName: z.string(),
      bountyId: z.number(),
      linkingMethod: z.string(),
      currentUserId: z.number(),
    })
  )
  .mutation(
    async ({
      input: {
        description,
        title,
        organizationName,
        repositoryName,
        bountyId,
        linkingMethod,
        number,
        currentUserId,
        newIssue,
      },
      ctx,
    }) => {
      let issueNumber = number;
      if (newIssue) {
        try {
          const currUser = await getUserById(ctx.user.id);
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
            url: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/users/${currUser.githubId}`,
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${auth0Token}`,
            },
          });

          const octokit = new Octokit({
            auth: githubTokenResponse.data.identities[0].access_token,
          });

          const octokitData = await octokit.request(
            "POST /repos/{owner}/{repo}/issues",
            {
              owner: organizationName,
              repo: repositoryName,
              title: title,
              body: description,
            }
          );
          issueNumber = octokitData.data.number;
        } catch (e) {
          console.error(e);
        }
      }
      const bounty = await helpers.getBounty(bountyId, currentUserId);
      const repository = await helpers.getRepository(
        repositoryName,
        organizationName
      );
      const issue = await helpers.createIssue(
        title,
        issueNumber,
        description,
        linkingMethod,
        repository,
        bounty
      );
      return await helpers.getBounty(bountyId, currentUserId);
    }
  );
