import { voteToCancelFFA } from "@/escrow/adapters";
import { useUserWallet } from "@/src/providers";
import { useState } from "react";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { BOUNTY_USER_RELATIONSHIP, BountyState } from "@/types/";
import { updateList } from "@/src/utils";
import { BountyActionsButton } from ".";
import toast from "react-hot-toast";

export const VoteToCancel = () => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.update.useMutation();

  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  if (
    !currentBounty ||
    !(
      (currentBounty.isCreator ||
        currentBounty.isCurrentSubmitter ||
        currentBounty.isDeniedSubmitter ||
        currentBounty.isChangesRequestedSubmitter) &&
      !currentBounty.isVotingCancel
    )
  )
    return null;

  const confirmAction = (): Promise<void> => {
    setIsAwaitingResponse(true);

    return new Promise<void>((resolve, reject) => {
      const handleYes = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        resolve();
      };

      const handleNo = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        reject();
      };

      const toastId = toast(
        (t) => (
          <div>
            Are you sure you want to cancel the Quest?
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="border border-secondaryBtnBorder bg-secondaryBtn flex
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="border border-primaryBtnBorder bg-primaryBtn flex
                items-center justify-center rounded-md px-3 py-1"
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });
  };

  const onClick = async () => {
    try {
      await confirmAction();

      let signature = "";
      if (currentBounty?.isCreator || currentBounty?.isCurrentSubmitter) {
        signature = await voteToCancelFFA(
          new PublicKey(currentBounty?.creator.publicKey),
          new PublicKey(currentWallet.publicKey),
          currentBounty?.escrow,
          currentWallet,
          program,
          provider
        );
      }
      const newRelations = updateList(
        currentBounty?.currentUserRelationsList,
        [],
        [BOUNTY_USER_RELATIONSHIP.VotingCancel]
      );
      const updatedBounty = await mutateAsync({
        bountyId: currentBounty?.id,
        currentUserId: currentUser.id,
        userId: currentUser.id,
        relations: newRelations,
        state: BountyState.VOTING_TO_CANCEL,
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty?.escrowid,
        signature,
        label: "vote-to-cancel",
      });
      setCurrentBounty(updatedBounty);
    } catch (err) {
      toast.error("User rejected this action");
    }
  };

  return (
    <BountyActionsButton
      type="red"
      text="Vote To Cancel"
      disabled={isAwaitingResponse}
      onClick={onClick}
    />
  );
};
