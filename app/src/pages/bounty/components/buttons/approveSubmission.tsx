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
      compressed: false,
    },
    projectId: 1,
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
    const nfts = await underdogClient.getNfts({
      params,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: currentWallet.publicKey.toString(),
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
    if (nfts.totalResults > 0) {
      return underdogClient.partialUpdateNft({
        params: { ...params, nftId: nfts.results[0].id },
        body: {
          attributes: {
            "Last Updated": new Date().toISOString(),
          },
        },
      });
    }

    setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Approve
    </button>
  );
};
