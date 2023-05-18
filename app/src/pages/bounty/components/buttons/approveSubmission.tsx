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
  const params = {
    type: {
      transferable: false,
      compressed: false,
    },
    projectId: 1,
  };

  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    // const signature = await approveRequestFFA(
    //   new PublicKey(currentBounty.currentSubmitter.publicKey),
    //   currentBounty.escrow,
    //   currentWallet,
    //   program,
    //   provider
    // );
    // currentBounty.currentUserRelationsList.push(
    //   BOUNTY_USER_RELATIONSHIP.Completer
    // );
    // const { updatedBounty } = await mutateAsync({
    //   bountyId: currentBounty.id,
    //   currentUserId: currentUser.id,
    //   userId: currentUser.id,
    //   relations: currentBounty.currentUserRelationsList,
    //   state: BountyState.COMPLETE,
    //   publicKey: currentWallet.publicKey.toString(),
    //   provider: currentWallet.providerName,
    //   escrowId: currentBounty.escrowid,
    //   signature,
    //   label: "complete-bounty",
    // });
    const nfts = await underdogClient.getNfts({
      params,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: currentWallet.publicKey.toString(),
      },
    });
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

    // const authToken = getCookie("githubToken") as string;

    // const octokit = new Octokit({
    //   auth: authToken,
    // });

    // const octokitResponse = await octokit.request(
    //   "PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge",
    //   {
    //     owner: currentBounty.repository.organization,
    //     repo: currentBounty.repository.name,
    //     pull_number: parseInt(currentBounty.pullRequests[0].number.toString()),
    //   }
    // );
    // console.log(octokitResponse);

    // setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Approve
    </button>
  );
};
