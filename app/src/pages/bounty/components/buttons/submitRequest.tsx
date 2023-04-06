import { addSubmitterFFA, submitRequestFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, IssueState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";

export const SubmitRequest = ({ disabled }: { disabled?: boolean }) => {
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
    const signature = await submitRequestFFA(
      new PublicKey(wallet.publicKey),
      wallet.publicKey,
      currentBounty.escrow,
      wallet,
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
      state: IssueState.AWAITING_REVIEW,
      walletId: currentUser.currentWallet.id,
      escrowId: currentBounty.escrowid,
      signature,
      label: "submit-request",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <button
      className={classNames("button-primary", { disabled })}
      onClick={onClick}
    >
      Submit
    </button>
  );
};
