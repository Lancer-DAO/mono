import { useState } from "react";
import { denyRequestFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { updateList } from "@/src/utils";
import { QuestActionsButton } from ".";
import toast from "react-hot-toast";

export const DenySubmission = () => {
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
      [BOUNTY_USER_RELATIONSHIP.DeniedSubmitter]
    );

    const updatedBounty = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: newRelations,
      state: BountyState.ACCEPTING_APPLICATIONS,
      publicKey: currentBounty.currentSubmitter.publicKey,
      escrowId: currentBounty.escrowid,
      signature,
      label: "deny-submission",
    });

    setCurrentBounty(updatedBounty);
    setIsLoading(false);
    toast.success("Submission denied");
  };

  return (
    <QuestActionsButton
      type="red"
      text="Deny Submission"
      onClick={onClick}
      isLoading={isLoading}
    />
  );
};
