import { BountyUserType } from "@/prisma/queries/bounty";
import { smallClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import Image from "next/image";
import { FC } from "react";
import { EApplicantsView } from "./ApplicantsView";
import { QuestActionView } from "./QuestActions";

dayjs.extend(relativeTime);

interface Props {
  user: BountyUserType;
  setSelectedSubmitter: Dispatch<SetStateAction<BountyUserType | null>>;
  setCurrentApplicantsView: Dispatch<SetStateAction<EApplicantsView>>;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const ApplicantProfileCard: FC<Props> = ({
  user,
  setSelectedSubmitter,
  setCurrentApplicantsView,
  setCurrentActionView,
}) => {
  const { currentBounty } = useBounty();

  if (!currentBounty) return null;

  return (
    <div
      className="w-full flex flex-col gap-3 bg-white
      justify-center rounded-md"
    >
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
        {/* TODO: conditionally render the following buttons */}
        {currentBounty.shortlistedSubmitters.some(
          (submitter) => submitter.userid === user.userid
        ) && (
          <motion.button
            {...smallClickAnimation}
            // onClick={() => {
            //   setSelectedSubmitter(user);
            //   setCurrentActionView(QuestActionView.Chat);
            // }}
            className="bg-white border border-neutral200 rounded-md 
            text-primary200 title-text px-4 py-2 disabled:opacity-80 
            disabled:cursor-not-allowed"
            disabled={true}
          >
            Chat
          </motion.button>
        )}
        {currentBounty.requestedSubmitters.some(
          (submitter) => submitter.userid === user.userid
        ) && (
          <motion.button
            {...smallClickAnimation}
            // onClick={() => {
            //   setSelectedSubmitter(user);
            //   setCurrentActionView(QuestActionView.Chat);
            // }}
            className="bg-[#F0F0F0] rounded-md 
            text-neutral600 title-text px-4 py-2 
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            $1500 Quote
          </motion.button>
        )}
        {currentBounty.deniedRequesters.some(
          (submitter) => submitter.userid === user.userid
        ) && (
          <motion.button
            {...smallClickAnimation}
            onClick={() => {
              setSelectedSubmitter(user);
              setCurrentApplicantsView(EApplicantsView.Individual);
            }}
            className="bg-white text-neutral500 title-text"
          >
            View
          </motion.button>
        )}
        {/* <button className="text-neutral600 text-xs">$X Quote</button> */}
        {/* <button className="text-neutral600 text-xs">Chat</button> */}
      </div>
      <p className="text-xs">{user.user.bio}</p>
    </div>
  );
};

export default ApplicantProfileCard;
