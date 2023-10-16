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
import { createDM } from "@/src/utils/sendbird";
import { ChannelProvider } from "@sendbird/uikit-react/Channel/context";
import ChatList from "./ChatList";
import SendMessage from "./SendMessage";
import { useUserWallet } from "@/src/providers";
import AlertCards from "../AlertCards";
import { ConciergeBell, X } from "lucide-react";
import { Tooltip } from "@/components";
import { DollarSign } from "react-feather";

interface Props {
  selectedSubmitter: BountyUserType | null;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const ChatView: FC<Props> = ({ selectedSubmitter, setCurrentActionView }) => {
  const [channel, setChannel] = useState<string>(
    "sendbird_group_channel_285084156_0b7fc17ca999c4eccd1bc09829866ef026473658"
  );

  const { currentUser } = useUserWallet();
  const { currentBounty, setCurrentApplicationView, hasApplied } = useBounty();

  const { data: update } = api.update.getNewUpdateByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );

  useEffect(() => {
    (async () => {
      const chatter = currentBounty?.isCreator
        ? currentBounty.state === BountyState.ACCEPTING_APPLICATIONS
          ? selectedSubmitter.user.id
          : currentBounty.approvedSubmitters[0].user.id
        : currentUser.id;
      const _url = await createDM([
        String(currentBounty.creator.userid),
        String(chatter),
      ]);

      setChannel(_url);
    })();
  }, [selectedSubmitter, currentBounty]);

  return (
    <div className="flex h-full flex-col relative overflow-hidden">
      <ActionsCardBanner
        title={`Conversation with ${
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
                className="group"
              >
                <ConciergeBell size={20} color="white" />
                <Tooltip text="Submit Update" right="0px" bottom="-25px" />
              </motion.button>
            )}
          {currentBounty.isCreator &&
            !!update &&
            currentBounty.state !== BountyState.AWAITING_REVIEW && (
              <motion.button
                {...smallClickAnimation}
                onClick={() => {
                  setCurrentActionView(QuestActionView.ViewUpdate);
                }}
                className="group"
              >
                <ConciergeBell size={20} color="white" />
                <Tooltip text="View Lancer Update" right="0px" bottom="-25px" />
              </motion.button>
            )}
          {hasApplied && !currentBounty.isCreator && (
            <motion.button
              {...smallClickAnimation}
              onClick={() => {
                setCurrentActionView(QuestActionView.SubmitApplication);
                setCurrentApplicationView(QuestApplicationView.SubmitQuote);
              }}
              className="group"
            >
              <DollarSign size={20} color="white" />
              <Tooltip text="Submit/View Quote" right="0px" bottom="-25px" />
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
        <AlertCards />
        <ChannelProvider channelUrl={channel}>
          <div className="w-full h-[calc(44.5rem-180px)] flex flex-col justify-between">
            <div id="chat" className="flex-grow overflow-y-auto">
              <ChatList />
            </div>
            <SendMessage />
          </div>
        </ChannelProvider>
      </div>
    </div>
  );
};

export default ChatView;
