import { FC } from "react";
import { cancelFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyState } from "@/src/types";
import { api } from "@/src/utils/api";
import { Button } from "@/components";

const CancelEscrow: FC = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

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
      escrowId: currentBounty.escrowid,
      signature,
      label: "cancel-escrow",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <Button onClick={onClick} disabled={!currentWallet.publicKey}>
      Cancel
    </Button>
  );
};

export default CancelEscrow;
