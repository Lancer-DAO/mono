import { FC } from "react";
import Image from "next/image";
import { BountyUserType } from "@/prisma/queries/bounty";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
interface Props {
  user: BountyUserType;
}

const ApplicantProfileCard: FC<Props> = ({ user }) => {
  return (
    <div className="w-full flex flex-col gap-3 bg-white hover:bg-neutral100 justify-center rounded-md">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={user.user.picture}
            alt="user avatar"
            width={36}
            height={36}
            className="rounded-full overflow-hidden"
          />
          <div className="flex flex-col">
            <p className="text-neutral600 title-text">{user.user.name}</p>
            <p className="text-neutral500 text-xs">{`${user.user.experience} XP`}</p>
          </div>
        </div>
      </div>
      <p className="text-xs">{user.user.bio}</p>
    </div>
  );
};

export default ApplicantProfileCard;
