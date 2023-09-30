import React from "react";
import QuestTable from "./components/QuestTable/QuestTable";
import { api } from "@/src/utils";
import { useBounty } from "@/src/providers/bountyProvider";
import { UpdateTable } from "@/components";

export const Bounties = () => {
  const { questsPage } = useBounty();

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
