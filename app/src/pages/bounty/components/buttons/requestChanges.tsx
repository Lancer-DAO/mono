import {
  addSubmitterFFA,
  denyRequestFFA,
  submitRequestFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, BountyState, User } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";

export const RequestChanges = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),

      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentSubmitter.relations.push(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );
    const index = currentBounty.currentSubmitter.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );

    if (index !== -1) {
      currentBounty.currentSubmitter.relations.splice(index, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: currentBounty.currentSubmitter.relations,
      state: BountyState.IN_PROGRESS,
      walletId: currentUser.currentWallet.id,
      escrowId: currentBounty.escrowid,
      signature,
      label: "request-changes",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Request Changes
    </button>
  );
};
