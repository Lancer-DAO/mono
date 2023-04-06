import {
  addSubmitterFFA,
  cancelFFA,
  denyRequestFFA,
  submitRequestFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, IssueState } from "@/src/types";
import { api } from "@/src/utils/api";
import classNames from "classnames";

export const CancelEscrow = () => {
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
    const signature = await cancelFFA(
      currentBounty.escrow,
      wallet,
      program,
      provider
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: currentBounty.currentSubmitter.relations,
      state: IssueState.CANCELED,
      walletId: currentUser.currentWallet.id,
      escrowId: currentBounty.escrowid,
      signature,
      label: "cancel-escrow",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Cancel
    </button>
  );
};
