import React from "react";
import QuestTable from "./components/QuestTable/QuestTable";
import UpdatesHistory from "@/components/molecules/UpdatesHistory";
import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";
import { useBounty } from "@/src/providers/bountyProvider";

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
    <div className="flex gap-[30px] bg-[#F7F7FB] w-full px-[30px] py-24 mt-5">
      <QuestTable type="quests" user={currentUser} allBounties={allBounties} />
      <UpdatesHistory />
    </div>
  );
};
