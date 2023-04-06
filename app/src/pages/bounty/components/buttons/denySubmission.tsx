import {
  addSubmitterFFA,
  denyRequestFFA,
  submitRequestFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, IssueState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";

export const DenySubmission = () => {
  const {
    currentUser,
    currentBounty,
    wallet,
    provider,
    program,
    setCurrentBounty,
    setCurrentUser,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      wallet,
      program,
      provider
    );
    currentBounty.currentSubmitter.relations.push(
      BOUNTY_USER_RELATIONSHIP.DeniedSubmitter
    );
    const index = currentBounty.currentSubmitter.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );

    if (index !== -1) {
      currentBounty.currentSubmitter.relations.splice(index, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: currentBounty.currentSubmitter.relations,
      state: IssueState.IN_PROGRESS,
      walletId: currentUser.currentWallet.id,
      escrowId: currentBounty.escrowid,
      signature,
      label: "add-approved-submitter",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Apply
    </button>
  );
};
