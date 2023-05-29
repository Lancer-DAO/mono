import { addSubmitterFFA, submitRequestFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";

export const SubmitRequest = ({ disabled }: { disabled?: boolean }) => {
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
    const signature = await submitRequestFFA(
      new PublicKey(currentBounty.creator.publicKey),
      currentWallet.publicKey,
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );
    const index = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
    );

    if (index !== -1) {
      currentBounty.currentUserRelationsList.splice(index, 1);
    }

    const index2 = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );

    if (index2 !== -1) {
      currentBounty.currentUserRelationsList.splice(index2, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.AWAITING_REVIEW,
      publicKey: currentWallet.publicKey.toString(),
      provider: currentWallet.providerName,
      escrowId: currentBounty.escrowid,
      signature,
      label: "submit-request",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <button
      className={classNames("button-primary", disabled)}
      onClick={onClick}
    >
      Submit
    </button>
  );
};
