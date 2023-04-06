import { addSubmitterFFA, submitRequestFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, IssueState } from "@/src/types";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import classNames from "classnames";

export const SubmitRequest = () => {
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
    currentUser.relations.push(BOUNTY_USER_RELATIONSHIP.CurrentSubmitter);
    const index = currentUser.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
    );

    if (index !== -1) {
      currentUser.relations.splice(index, 1);
    }

    const index2 = currentUser.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );

    if (index2 !== -1) {
      currentUser.relations.splice(index2, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      userId: currentUser.id,
      relations: currentUser.relations,
      state: IssueState.AWAITING_REVIEW,
      walletId: currentUser.currentWallet.id,
      escrowId: currentBounty.escrowid,
      signature,
      label: "submit-request",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Apply
    </button>
  );
};
