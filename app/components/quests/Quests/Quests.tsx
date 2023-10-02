import QuestTable from "./components/QuestTable/QuestTable";
import { UpdateTable } from "@/components";
import { useBounty } from "@/src/providers/bountyProvider";
import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";

export const Bounties = () => {
  const { questsPage, setAllBounties } = useBounty();
  const { currentUser } = useUserWallet();
  const { data: allBounties } = api.bounties.getAllBounties.useQuery(
    {
      currentUserId: currentUser.id,
      page: questsPage,
    },
    {
      enabled: !!currentUser,

      onSuccess: (data) => {
        setAllBounties(data);
      },
    }
  );
  return (
    <div className="grid grid-cols-5 gap-[30px] bg-[#F7F7FB] w-full px-[30px] py-24 mt-5">
      <div className="col-span-3">
        <QuestTable type="quests" />
      </div>
      <div className="col-span-2">
        <UpdateTable allUpdates={true} />
      </div>
    </div>
  );
};
