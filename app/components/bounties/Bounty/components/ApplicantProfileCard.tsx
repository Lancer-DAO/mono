import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { BountyUserType } from "@/prisma/queries/bounty";
import { ProfileNFT } from "@/types";
import { createUnderdogClient } from "@underdog-protocol/js";
import { IS_CUSTODIAL, PROFILE_PROJECT_PARAMS } from "@/src/constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const underdogClient = createUnderdogClient({});
interface Props {
  user: BountyUserType;
}

const ApplicantProfileCard: FC<Props> = ({ user }) => {
  return (
    <div className="w-full flex flex-col gap-3">
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
            <p className="text-neutral500 text-xs">{`${user.user.reputation} XP`}</p>
          </div>
        </div>
      </div>
      <p className="text-neutral400 text-xs">{user.user.bio}</p>
    </div>
  );
};

export default ApplicantProfileCard;
