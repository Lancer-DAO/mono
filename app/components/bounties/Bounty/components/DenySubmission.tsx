import { Button } from "@/components";
import { denyRequestFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { updateList } from "@/src/utils";

export const DenySubmission = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  if (
    !(
      currentBounty.isCreator &&
      currentBounty.currentSubmitter &&
      !currentBounty.completer
    )
  ) {
    return null;
  }

  const onClick = async () => {
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );

    const newRelations = updateList(
      currentBounty.currentUserRelationsList,
      [],
      [BOUNTY_USER_RELATIONSHIP.DeniedSubmitter]
    );

    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: newRelations,
      state: BountyState.ACCEPTING_APPLICATIONS,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "deny-submitter",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <Button onClick={onClick} disabled={!currentWallet.publicKey}>
      Deny
    </Button>
  );
};
