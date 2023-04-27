import {
  addSubmitterFFA,
  cancelFFA,
  denyRequestFFA,
  submitRequestFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/src/types";
import { api } from "@/src/utils/api";
import classNames from "classnames";

export const CancelEscrow = () => {
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
    const signature = await cancelFFA(
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: [...currentBounty.currentUserRelationsList, "canceler"],
      state: BountyState.CANCELED,
      publicKey: currentWallet.publicKey.toString(),
      provider: currentWallet.providerName,
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
