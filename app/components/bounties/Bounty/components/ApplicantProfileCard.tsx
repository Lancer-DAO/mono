
import { Dispatch, FC, SetStateAction } from "react";
import Image from "next/image";
import { BountyUserType } from "@/prisma/queries/bounty";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useBounty } from "@/src/providers/bountyProvider";
import { EApplicantsView } from "./ApplicantsView";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
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
        {currentBounty.shortlistedLancers.some(
          (submitter) => submitter.userid === user.userid
        ) && (
          <div className="flex items-center gap-2">
            <motion.button
              {...smallClickAnimation}
              onClick={() => {
                setSelectedSubmitter(user);
                setCurrentApplicantsView(EApplicantsView.Individual);
              }}
              className="bg-[#F0F0F0] rounded-md flex items-center gap-1
              text-neutral600 title-text px-4 py-2 
              disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Flame width={16} height={16} className="text-tertiary200" />{" "}
              $1500 Quote
            </motion.button>
            {Number(currentBounty.escrow.amount) > 0 && (
              <motion.button
                {...smallClickAnimation}
                onClick={() => {
                  setSelectedSubmitter(user);
                  setCurrentActionView(QuestActionView.Chat);
                }}
                className="bg-white border border-neutral200 px-4 py-2 rounded-md flex items-center gap-2"
              >
                <p className="text-neutral600 title-text">Chat</p>
                <svg
                  width="6"
                  height="6"
                  viewBox="0 0 8 8"
                  fill="none"
                  className="animate-pulse"
                >
                  <circle cx="4" cy="4" r="4" fill="#10966D" />
                </svg>
              </motion.button>
            )}
          </div>
        )}
        {currentBounty.requestedLancers.some(
          (submitter) => submitter.userid === user.userid
        ) && (
          <motion.button
            {...smallClickAnimation}
            onClick={() => {
              setSelectedSubmitter(user);
              setCurrentApplicantsView(EApplicantsView.Individual);
            }}
            className="bg-[#F0F0F0] rounded-md flex items-center gap-1
            text-neutral600 title-text px-4 py-2 
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Flame width={16} height={16} className="text-tertiary200" /> $1500
            Quote
          </motion.button>
        )}
        {currentBounty.deniedLancers.some(
          (submitter) => submitter.userid === user.userid
        ) && (
          <motion.button
            {...smallClickAnimation}
            onClick={() => {
              setSelectedSubmitter(user);
              setCurrentApplicantsView(EApplicantsView.Individual);
            }}
            className="bg-white border border-neutral200 text-neutral500 
            title-text px-4 py-2 rounded-md"
          >
            View
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default ApplicantProfileCard;
