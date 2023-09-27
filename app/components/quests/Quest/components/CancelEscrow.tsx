import { FC, useState } from "react";
import { cancelFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { api } from "@/src/utils/api";
import { updateList } from "@/src/utils";
import { QuestActionsButton } from ".";
import toast from "react-hot-toast";

export const CancelEscrow: FC = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const [isLoading, setIsLoading] = useState(false);

  if (
    !currentBounty ||
    !(currentBounty.isCreator && currentBounty.needsToVote.length === 0)
  )
    return null;

  const onClick = async () => {
    setIsLoading(true);
    // If we are the creator, then skip requesting and add self as approved
    const signature = await cancelFFA(
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    const newRelation = updateList(
      currentBounty.currentUserRelationsList,
      [],
      [BOUNTY_USER_RELATIONSHIP.Canceler]
    );
    const updatedBounty = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: newRelation,
      state: BountyState.CANCELED,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "cancel-escrow",
    });

    setCurrentBounty(updatedBounty);
    setIsLoading(false);
    toast.success("Bounty canceled");
  };

  return (
    <QuestActionsButton
      type="red"
      text="Cancel Bounty"
      onClick={onClick}
      isLoading={isLoading}
    />
  );
};