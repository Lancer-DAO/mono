import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import QuestDetails from "./components/QuestDetails";
import QuestActions from "./components/QuestActions";
import { AdminRelationsManagerList } from "./components";

export const Quest = () => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

  if (!currentUser || !currentBounty) {
    return null;
  }

  return (
    <>
      <div className="w-full max-w-[1700px] mx-auto h-full flex justify-center gap-5 mt-10 py-24 px-3 sm:px-20">
        <QuestDetails />
        <QuestActions />
      </div>

      {currentUser.isAdmin && (
        <div className="w-full h-full flex flex-col sm:flex-row justify-evenly mt-10 py-24">
          <AdminRelationsManagerList />
          <div></div>
        </div>
      )}
    </>
  );
};