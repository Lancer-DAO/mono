import { voteToCancelFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { updateList } from "@/src/utils";
import { BountyActionsButton } from ".";

export const VoteToCancel = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  if (
    !(
      (currentBounty.isCreator ||
        currentBounty.isCurrentSubmitter ||
        currentBounty.isDeniedSubmitter ||
        currentBounty.isChangesRequestedSubmitter) &&
      !currentBounty.isVotingCancel
    )
  ) {
    return null;
  }

  const onClick = async () => {
    if (
      !window.confirm("Are you sure you want to vote to cancel this Quest?")
    ) {
      return;
    }
    let signature = "";
    if (currentBounty.isCreator || currentBounty.isCurrentSubmitter) {
      signature = await voteToCancelFFA(
        new PublicKey(currentBounty.creator.publicKey),
        new PublicKey(currentWallet.publicKey),
        currentBounty.escrow,
        currentWallet,
        program,
        provider
      );
    }
    const newRelations = updateList(
      currentBounty.currentUserRelationsList,
      [],
      [BOUNTY_USER_RELATIONSHIP.VotingCancel]
    );
    const updatedBounty = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: newRelations,
      state: BountyState.VOTING_TO_CANCEL,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "vote-to-cancel",
    });
    setCurrentBounty(updatedBounty);
  };

  return (
    <BountyActionsButton type="red" text="Vote To Cancel" onClick={onClick} />
  );
};
