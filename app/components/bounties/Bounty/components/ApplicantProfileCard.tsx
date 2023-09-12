import { FC } from "react";
import Image from "next/image";
import { User } from "@prisma/client";
import { BountyUserType } from "@/prisma/queries/bounty";

interface Props {
  user: BountyUserType;
}

const ApplicantProfileCard: FC<Props> = ({ user }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Image
            src={user.user.picture}
            alt="user avatar"
            width={36}
            height={36}
          />
          <div className="flex flex-col">
            <p className="text-neutral600 title-text">{user.user.name}</p>
            <p className="text-neutral500 text-xs">{`XP`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfileCard;
