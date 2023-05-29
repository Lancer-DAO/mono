import { approveRequestFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyState,
  LancerWallet,
} from "@/src/types";
import { api } from "@/src/utils/api";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import classNames from "classnames";
import { getCookie } from "cookies-next";
import { Octokit } from "octokit";
import { useEffect, useState } from "react";
import { createUnderdogClient, useProject, Nft } from "@underdog-protocol/js";
import dayjs from "dayjs";
import {
  DEVNET_BOUNTY_PROJECT_PARAMS,
  DEVNET_PROFILE_PROJECT_PARAMS,
} from "@/src/constants";

const underdogClient = createUnderdogClient({});
export const ApproveSubmission = () => {
  const {
    currentUser,
    currentBounty,
    provider,
    program,
    currentWallet,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();

  const { currentAPIKey } = useLancer();
  const params = {
    type: {
      transferable: false,
      compressed: true,
    },
    projectId: 2,
  };

  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await approveRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.Completer
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.COMPLETE,
      publicKey: currentWallet.publicKey.toString(),
      provider: currentWallet.providerName,
      escrowId: currentBounty.escrowid,
      signature,
      label: "complete-bounty",
    });
    const submitterKey = currentBounty.currentSubmitter.publicKey;
    const creatorKey = currentBounty.creator.publicKey;
    const nfts = await underdogClient.getNfts({
      params,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: submitterKey,
      },
    });

    setCurrentBounty(updatedBounty);

    const octokit = new Octokit({
      auth: currentAPIKey.token,
    });

    const octokitResponse = await octokit.request(
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge",
      {
        owner: updatedBounty.repository.organization,
        repo: updatedBounty.repository.name,
        pull_number: updatedBounty.pullRequests[0].number.toNumber(),
      }
    );
    const reputationIncrease = 100 * updatedBounty.estimatedTime.toNumber();
    if (nfts.totalResults > 0) {
      const profileNFT = nfts.results[0];
      underdogClient.partialUpdateNft({
        params: { ...DEVNET_PROFILE_PROJECT_PARAMS, nftId: nfts.results[0].id },
        body: {
          attributes: {
            lastUpdated: new Date().toISOString(),
            reputation:
              (profileNFT.attributes.reputation as number) + reputationIncrease,
          },
        },
      });
    }
    await underdogClient.createNft({
      params: DEVNET_BOUNTY_PROJECT_PARAMS,
      body: {
        name: `${updatedBounty.title} - ${updatedBounty.repository.name}`,
        image: "https://i.imgur.com/3uQq5Zo.png",
        description: updatedBounty.description,
        attributes: {
          reputation: reputationIncrease,
          completed: dayjs().toISOString(),
          tags: updatedBounty.tags.map((tag) => tag.name).join(","),
          role: "completer",
        },
        upsert: true,
        receiverAddress: submitterKey,
      },
    });

    await underdogClient.createNft({
      params: DEVNET_BOUNTY_PROJECT_PARAMS,
      body: {
        name: `${updatedBounty.title} - ${updatedBounty.repository.name}`,
        image: "https://i.imgur.com/3uQq5Zo.png",
        description: updatedBounty.description,
        attributes: {
          reputation: reputationIncrease,
          completed: dayjs().toISOString(),
          tags: updatedBounty.tags.map((tag) => tag.name).join(","),
          role: "creator",
        },
        upsert: true,
        receiverAddress: creatorKey,
      },
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Approve
    </button>
  );
};
