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

export const updateBountyUser = protectedProcedure
  .input(
    z.object({
      bountyId: z.number(),
      currentUserId: z.number(),
      userId: z.number(),
      publicKey: z.string(),
      provider: z.string(),
      escrowId: z.number(),
      relations: z.array(z.string()),
      state: z.optional(z.string()),
      label: z.string(),
      signature: z.string(),
    })
  )
  .mutation(
    async ({
      input: {
        bountyId,
        currentUserId,
        userId,
        publicKey,
        escrowId,
        relations,
        state,
        label,
        signature,
        provider,
      },
      ctx,
    }) => {
      const user = await getUserById(userId);

      const wallet = await getOrCreateWallet(user, publicKey, provider);
      console.error("test");
      let bounty;
      let transaction;
      let userBounty = await prisma.bountyUser.findFirst({
        where: {
          userid: userId,
          bountyid: bountyId,
        },
      });
      console.log("relations", relations);
      if (!userBounty) {
        console.log("new");
        userBounty = await prisma.bountyUser.create({
          data: {
            userid: userId,
            bountyid: bountyId,
            relations: relations.join(),
          },
        });
      } else {
        console.log("exists");
        await prisma.bountyUser.update({
          where: {
            userid_bountyid: {
              userid: userId,
              bountyid: bountyId,
            },
          },
          data: {
            relations: relations.join(),
          },
        });
      }
      if (state) {
        bounty = await prisma.bounty.update({
          where: {
            id: bountyId,
          },
          data: {
            state,
          },
        });
      }
      if (signature || label) {
        const escrow = await prisma.escrow.findUnique({
          where: {
            id: escrowId,
          },
        });
        transaction = await prisma.transaction.create({
          data: {
            timestamp: Date.now().toString(),
            signature,
            label,
            wallets: {
              create: {
                walletid: wallet.id,
                relations: "",
              },
            },
            escrowid: escrowId,
            chainid: escrow.chainid,
          },
        });
      }
      if (label === "complete-bounty") {
        let step = "token";

        try {
          const currUser = await getUserById(currentUserId);
          const bountyInfo = await getBounty(bountyId, currentUserId);
          const pullRequest = await getPullRequestByID(
            bountyInfo.pullRequests[0].id
          );
          const repository = await getRepositoryByID(bountyInfo.repositoryid);
          console.log("token", ctx.user.token, currUser.githubId);
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
          step = "octo";
          console.log("gh", githubTokenResponse);

          const octokit = new Octokit({
            auth: githubTokenResponse.data.identities[0].access_token,
          });

          const octokitResponse = await octokit.request(
            "PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge",
            {
              owner: repository.organization,
              repo: repository.name,
              pull_number: pullRequest.number.toNumber(),
            }
          );
          console.log("octo", octokitResponse);
        } catch (e) {
          console.error(e);
          console.log(step);
        }
      }
      const updatedBounty = await getBounty(bountyId, currentUserId);
      return { updatedBounty };
    }
  );
