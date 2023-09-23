import { BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE } from "@/src/constants/tutorials";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useReferral } from "@/src/providers/referralProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP } from "@/types/";
import { updateList } from "@/src/utils";
import { QuestActionsButton } from ".";
import { useState } from "react";
import toast from "react-hot-toast";

export const ArchiveBounty = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();
  const { mutateAsync } = api.bounties.updateBountyToPrivate.useMutation();

  const [isLoading, setIsLoading] = useState(false);

  if (!currentBounty || !currentUser.isAdmin || currentBounty.isPrivate)
    return null;

  const onClick = async () => {
    setIsLoading(true);

    await mutateAsync({
      bountyId: currentBounty.id,
      isPrivate: true,
    });

    setIsLoading(false);

    toast.success("Quest archived successfully!");
  };

  return (
    <QuestActionsButton
      type="green"
      disabled={isLoading}
      text={isLoading ? "Loading..." : "Make Private"}
      onClick={onClick}
    />
  );
};
