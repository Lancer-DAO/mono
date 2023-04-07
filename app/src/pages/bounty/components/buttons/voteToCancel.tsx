import {
  addSubmitterFFA,
  cancelFFA,
  denyRequestFFA,
  submitRequestFFA,
  voteToCancelFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";

export const VoteToCancel = () => {
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
    // If we are the submitter, vote to cancel as submitter
    let signature = "";
    if (currentBounty.isCreator || currentBounty.isCurrentSubmitter) {
      signature = await voteToCancelFFA(
        new PublicKey(currentBounty.creator.publicKey),
        new PublicKey(wallet.publicKey),
        currentBounty.escrow,
        wallet,
        program,
        provider
      );
    }

    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.VotingCancel
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.VOTING_TO_CANCEL,
      walletId: currentUser.currentWallet.id,
      escrowId: currentBounty.escrowid,
      signature,
      label: "vote-to-cancel",
    });
    setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Vote To Cancel
    </button>
  );
};
