import { BountyUserType } from "@/prisma/queries/bounty";
import { smallClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { BountyState } from "@/types";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import ActionsCardBanner from "../ActionsCardBanner";
import AlertCard from "../AlertCard";
import { QuestActionView } from "../QuestActions";
import { createDM } from "@/src/utils/sendbird";
import { ChannelProvider } from "@sendbird/uikit-react/Channel/context";
import ChatList from "./ChatList";
import SendMessage from "./SendMessage";

interface Props {
  selectedSubmitter: BountyUserType | null;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const ChatView: FC<Props> = ({ selectedSubmitter, setCurrentActionView }) => {
  const [channel, setChannel] = useState<string>(
    "sendbird_group_channel_285084156_0b7fc17ca999c4eccd1bc09829866ef026473658"
  );

  const { currentBounty } = useBounty();

  const { data: update } = api.update.getNewUpdateByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );

  useEffect(() => {
    (async () => {
      const _url = await createDM([
        String(currentBounty.creator.userid),
        String(selectedSubmitter.userid),
      ]);

      setChannel(_url);
    })();
  }, [selectedSubmitter]);

  return (
    <div className="flex h-full max-h-[24.5rem] flex-col relative overflow-hidden">
      <ActionsCardBanner
        title={`Conversation with ${
          currentBounty.isCreator
            ? currentBounty.state === BountyState.ACCEPTING_APPLICATIONS
              ? selectedSubmitter.user.name
              : currentBounty.approvedSubmitters[0].user.name
            : currentBounty.creator.user.name
        } `}
      >
        {currentBounty.isCreator && (
          <motion.button
            onClick={() => {
              if (currentBounty.isCreator) {
                setCurrentActionView(QuestActionView.ViewApplicants);
              } else {
                setCurrentActionView(QuestActionView.SubmitApplication);
              }
            }}
            {...smallClickAnimation}
          >
            <X height={24} width={24} className="text-white" />
          </motion.button>
        )}
        {currentBounty.isApprovedSubmitter && !!update === false && (
          <motion.button
            {...smallClickAnimation}
            className="bg-secondary200 text-white title-text px-4 py-2 rounded-md"
            onClick={() => setCurrentActionView(QuestActionView.SubmitUpdate)}
          >
            Submit Update
          </motion.button>
        )}
      </ActionsCardBanner>
      <div className="">
        {update && currentBounty.isCreator && (
          <AlertCard
            type="positive"
            title="Nice!"
            description="You have received an update!"
          >
            <button
              className="bg-white px-4 py-2"
              onClick={() => setCurrentActionView(QuestActionView.ViewUpdate)}
            >
              View Update
            </button>
          </AlertCard>
        )}
        {update && currentBounty.isApprovedSubmitter && (
          <AlertCard
            type="positive"
            title="Nice!"
            description="Your update has been sent!"
          />
        )}

        <ChannelProvider channelUrl={channel}>
          <div className="w-full h-[calc(24.5rem-68px)] flex flex-col justify-between">
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
