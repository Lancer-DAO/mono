import React from "react";
import QuestTable from "./components/QuestTable/QuestTable";
import UpdatesHistory from "@/components/molecules/UpdatesHistory";
import { useUserWallet } from "@/src/providers";

export const Bounties = () => {
  const { currentUser } = useUserWallet();
  return (
    <div className="flex gap-[30px] bg-[#F7F7FB] w-full px-[30px] py-24 mt-5">
      <QuestTable type="quests" user={currentUser} />
      <UpdatesHistory />
    </div>
  );
};
