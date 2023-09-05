import { useState } from "react";
import { denyRequestFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { updateList } from "@/src/utils";
import { BountyActionsButton } from "./BountyActionsButton";

export const RequestChanges = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const [isLoading, setIsLoading] = useState(false);

  if (
    !currentBounty ||
    !(
      currentBounty.isCreator &&
      currentBounty.currentSubmitter &&
      !currentBounty.completer
    )
  )
    return null;

  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    setIsLoading(true);
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),

      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    const newRelations = updateList(
      [],
      [BOUNTY_USER_RELATIONSHIP.CurrentSubmitter],
      [BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter]
    );
    const updatedBounty = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: newRelations,
      state: BountyState.IN_PROGRESS,
      publicKey: currentBounty.currentSubmitter.publicKey,
      escrowId: currentBounty.escrowid,
      signature,
      label: "request-changes",
    });

    setCurrentBounty(updatedBounty);
    setIsLoading(false);
  };

  return (
    <BountyActionsButton
      type="neutral"
      text="Request Changes"
      onClick={onClick}
      isLoading={isLoading}
    />
  );
};
