import { FC } from "react";
import QuestTable from "@/components/quests/Quests/components/QuestTable/QuestTable";
import { User } from "@/types";

interface Props {
  user: User;
}

export const QuestsCard: FC<Props> = ({ user }) => {
  return (
    <div className="bg-white w-full border border-neutral200 rounded-md overflow-hidden">
      <p className="title-text text-neutral600 pt-5 px-5">Completed Quests</p>
      <QuestTable type="profile" user={user} />
    </div>
  );
};
