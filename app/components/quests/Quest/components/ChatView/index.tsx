import { BountyUserType } from "@/prisma/queries/bounty";
import { smallClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyState } from "@/types";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import ActionsCardBanner from "../ActionsCardBanner";
import { QuestActionView } from "../QuestActions";
import { createDM } from "@/src/utils/sendbird";
import { useAccount } from "@/src/providers/accountProvider";
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

  const { account } = useAccount();
  const { currentBounty } = useBounty();

  useEffect(() => {
    (async () => {
      const _url = await createDM([
        String(currentBounty.creator.userid),
        String(selectedSubmitter.userid),
      ]);

      setChannel(_url);
    })();
  }, [selectedSubmitter]);

  console.log(channel);

  return (
    <div className="flex h-full overflow-hidden flex-col">
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

        {currentBounty.isApprovedSubmitter && (
          <motion.button
            {...smallClickAnimation}
            className="bg-secondary200 text-white title-text px-4 py-2 rounded-md"
            onClick={() => setCurrentActionView(QuestActionView.SubmitUpdate)}
          >
            Submit Update
          </motion.button>
        )}
      </ActionsCardBanner>

      <ChannelProvider channelUrl={channel}>
        <div className="w-full h-full flex flex-col">
          <div id="chat" className="max-h-[12rem] h-full overflow-y-auto my-4">
            <ChatList />
          </div>
          <SendMessage />
        </div>
      </ChannelProvider>
    </div>
  );
};

export default ChatView;
