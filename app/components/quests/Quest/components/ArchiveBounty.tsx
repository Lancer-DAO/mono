import { useState } from "react";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils/api";
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

    const toastId = toast.success("Quest archived successfully!");
    setTimeout(() => {
      toast.dismiss(toastId);
    }, 2000);
  };

  return (
    <button
      className="whitespace-nowrap p-3 bg-primary200 text-white title-text 
      text-center rounded-md border flex items-center justify-between gap-1"
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? "Loading..." : "Make Private"}
    </button>
  );
};
