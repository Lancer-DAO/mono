import { FC } from "react";
import { ContributorInfo } from "@/components";
import { User } from "@prisma/client";

interface BountyActionsUserProps {
  title: string;
  users: User[];
}

const QuestUser: FC<BountyActionsUserProps> = ({ title, users }) => {
  return (
    <>
      <label className="font-bold text-sm">{title}</label>
      {users.map((user, index) => (
        <ContributorInfo user={user} key={index} />
      ))}
    </>
  );
};

export default QuestUser;
