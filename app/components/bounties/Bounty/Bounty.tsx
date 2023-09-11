import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import QuestDetails from "./components/QuestDetails";

export const Bounty = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

  if (!currentUser || !currentBounty) {
    return null;
  }

  return (
    <>
      <div className="w-full h-full flex flex-col sm:flex-row justify-evenly mt-10 py-24">
        {/* quest info */}
        <QuestDetails />
        {/* quest actions */}
      </div>
    </>
  );
};
