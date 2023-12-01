import { BountyUserType } from "@/prisma/queries/bounty";
import { smallClickAnimation } from "@/src/constants";
import {
  QuestActionView,
  QuestApplicationView,
  useBounty,
} from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { BountyState } from "@/types";
import { motion } from "framer-motion";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import ActionsCardBanner from "../ActionsCardBanner";
import { ChannelProvider } from "@sendbird/uikit-react/Channel/context";
import ChatList from "./ChatList";
import SendMessage from "./SendMessage";
import { useUserWallet } from "@/src/providers";
import AlertCards from "../AlertCards";
import { ConciergeBell, X } from "lucide-react";
import { Tooltip } from "@/components";

interface Props {
  selectedSubmitter: BountyUserType | null;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const ChatView: FC<Props> = ({ selectedSubmitter, setCurrentActionView }) => {
  const { currentUser } = useUserWallet();
  const { currentBounty, setCurrentApplicationView, hasApplied } = useBounty();

  const { data: update } = api.update.getNewUpdateByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );
  const { data: quote } = api.quote.getQuoteByBountyAndUser.useQuery(
    {
      bountyId: currentBounty.id,
      userId: currentUser.id,
    },
    { enabled: !!currentBounty && !!currentUser }
  );

  return (
    <div className="flex h-full flex-col relative overflow-hidden">
      <ActionsCardBanner
        title={`Quest with ${
          currentBounty.isCreator
            ? currentBounty.state === BountyState.ACCEPTING_APPLICATIONS
              ? selectedSubmitter.user.name
              : currentBounty.approvedSubmitters[0].user.name
            : currentBounty.creator.user.name
        } `}
      >
        <div className="flex items-center gap-4">
          {currentBounty.isApprovedSubmitter &&
            !!update === false &&
            currentBounty.state === BountyState.IN_PROGRESS && (
              <motion.button
                {...smallClickAnimation}
                onClick={() => {
                  setCurrentActionView(QuestActionView.SubmitUpdate);
                }}
                className="bg-primary200 px-4 py-[9px] rounded-md flex items-center gap-2"
              >
                <p className="text-white title-text">Submit Update</p>
              </motion.button>
            )}
          {!!update && currentBounty.state === BountyState.AWAITING_REVIEW && (
            <motion.button
              {...smallClickAnimation}
              onClick={() => {
                setCurrentActionView(QuestActionView.ViewUpdate);
              }}
              className="bg-white border border-neutral200 px-4 py-2 rounded-md flex items-center gap-2"
            >
              <p className="text-neutral600 title-text">View Update</p>
            </motion.button>
          )}
          {hasApplied && !currentBounty.isCreator && (
            <motion.button
              {...smallClickAnimation}
              onClick={() => {
                setCurrentActionView(QuestActionView.SubmitApplication);
                setCurrentApplicationView(QuestApplicationView.SubmitQuote);
              }}
              className="bg-white border border-neutral200 px-4 py-2 rounded-md flex items-center gap-2"
            >
              <p className="text-neutral600 title-text">
                {!!quote ? "Your Quote" : "Submit Quote"}
              </p>
            </motion.button>
          )}
          {currentBounty.isCreator && (
            <motion.button
              onClick={() => {
                setCurrentActionView(QuestActionView.ViewApplicants);
              }}
              {...smallClickAnimation}
            >
              <X height={24} width={24} className="text-white" />
            </motion.button>
          )}
        </div>
      </ActionsCardBanner>
      <div>
        <div className="pb-4">
          <AlertCards />
        </div>
      </div>
    </div>
  );
};

export default ChatView;
