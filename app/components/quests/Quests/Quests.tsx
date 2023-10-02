import QuestTable from "./components/QuestTable/QuestTable";
import { UpdateTable } from "@/components";

export const Bounties = () => {
  return (
    <div className="grid grid-cols-5 gap-[30px] bg-[#F7F7FB] w-full max-w-[1440px] mx-auto px-[30px] py-24 mt-5">
      <div className="col-span-3">
        <QuestTable type="quests" />
      </div>
      <div className="col-span-2">
        <UpdateTable allUpdates={true} />
      </div>
    </div>
  );
};
