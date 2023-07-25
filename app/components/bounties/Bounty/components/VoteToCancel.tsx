import { Button } from "@/components";
import { voteToCancelFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types";

const VoteToCancel = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const onClick = async () => {
    // If we are the submitter, vote to cancel as submitter
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

    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.VotingCancel
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.VOTING_TO_CANCEL,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "vote-to-cancel",
    });
    setCurrentBounty(updatedBounty);
  };

  return (
    <Button onClick={onClick} disabled={!currentWallet.publicKey}>
      Vote To Cancel
    </Button>
  );
};

export default VoteToCancel;
