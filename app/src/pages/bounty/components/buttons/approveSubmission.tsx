import { addSubmitterFFA, approveRequestFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, IssueState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";
import { getCookie } from "cookies-next";
import { Octokit } from "octokit";

export const ApproveSubmission = () => {
  const {
    currentUser,
    currentBounty,
    wallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await approveRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      wallet,
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
      state: IssueState.COMPLETE,
      walletId: currentUser.currentWallet.id,
      escrowId: currentBounty.escrowid,
      signature: "",
      label: "complete-bounty",
    });
    const authToken = getCookie("githubToken") as string;

    const octokit = new Octokit({
      auth: authToken,
    });

    const octokitResponse = await octokit.request(
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge",
      {
        owner: currentBounty.repository.organization,
        repo: currentBounty.repository.name,
        pull_number: parseInt(currentBounty.pullRequests[0].number.toString()),
      }
    );
    console.log(octokitResponse);

    // setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Approve
    </button>
  );
};
