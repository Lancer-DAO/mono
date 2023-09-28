import React from "react";
import QuestTable from "./components/QuestTable/QuestTable";
import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";
import { useBounty } from "@/src/providers/bountyProvider";
import { UpdateTable } from "@/components";

export const Bounties = () => {
  const { currentUser } = useUserWallet();
  const { questsPage } = useBounty();

  const { data: allBounties } = api.bounties.getAllBounties.useQuery(
    {
      currentUserId: currentUser ? currentUser.id : null,
      page: questsPage,
    },
    {
      enabled: !!currentUser,
    }
  );
  return (
    <div className="grid grid-cols-5 gap-[30px] bg-[#F7F7FB] w-full px-[30px] py-24 mt-5">
      <div className="col-span-3">
        <QuestTable
          type="quests"
          user={currentUser}
          allBounties={allBounties}
        />
      </div>
      <div className="col-span-2">
        <UpdateTable allUpdates={true} />
      </div>
    </div>
  );
};
