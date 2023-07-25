import { Button } from "@/components";
import { denyRequestFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types";

const RequestChanges = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

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
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "request-changes",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <Button onClick={onClick} disabled={!currentWallet.publicKey}>
      Request Changes
    </Button>
  );
};

export default RequestChanges;
