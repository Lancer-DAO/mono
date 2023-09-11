import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import QuestDetails from "./components/QuestDetails";
import QuestActions from "./components/QuestActions";
import { useRouter } from "next/router";
import { api } from "@/utils";

export const Quest = () => {
  const { currentUser } = useUserWallet();
  const { setCurrentBounty, currentBounty } = useBounty();
  const router = useRouter();
  api.bounties.getBounty.useQuery(
    {
      id: parseInt(router.query.quest as string),
      currentUserId: currentUser?.id,
    },
    {
      enabled: !!currentUser,
      onSuccess: (data) => {
        setCurrentBounty(data);
      },
    }
  );

  if (!currentUser || !currentBounty) {
    return null;
  }

  return (
    <>
      <div className="w-full h-full flex flex-col sm:flex-row justify-evenly mt-10 py-24">
        {/* quest info */}
        <QuestDetails />
        {/* quest actions */}
        <QuestActions />
      </div>
    </>
  );
};
