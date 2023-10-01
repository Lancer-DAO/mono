import { BountyUserType } from "@/prisma/queries/bounty";
import { smallClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { BountyState } from "@/types";
import { cubicBezier, motion } from "framer-motion";
import { X } from "lucide-react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import ActionsCardBanner from "../ActionsCardBanner";
import AlertCard from "../AlertCard";
import { QuestActionView } from "../QuestActions";
import { createDM } from "@/src/utils/sendbird";
import { ChannelProvider } from "@sendbird/uikit-react/Channel/context";
import ChatList from "./ChatList";
import SendMessage from "./SendMessage";
import { currentUser } from "@/server/api/routers/users/currentUser";
import { useUserWallet } from "@/src/providers";

interface Props {
  selectedSubmitter: BountyUserType | null;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const ChatView: FC<Props> = ({ selectedSubmitter, setCurrentActionView }) => {
  const [channel, setChannel] = useState<string>(
    "sendbird_group_channel_285084156_0b7fc17ca999c4eccd1bc09829866ef026473658"
  );

  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();

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
    <div className="flex h-full max-h-[44.5rem] flex-col relative overflow-hidden">
      <ActionsCardBanner
        title={`Conversation with ${
          currentBounty.isCreator
            ? currentBounty.state === BountyState.ACCEPTING_APPLICATIONS
              ? selectedSubmitter.user.name
              : currentBounty.approvedSubmitters[0].user.name
            : currentBounty.creator.user.name
        } `}
      >
        <div className="flex items-center gap-3">
          {currentBounty.isApprovedSubmitter &&
            !!update === false &&
            currentBounty.state === BountyState.IN_PROGRESS && (
              <motion.button
                {...smallClickAnimation}
                className="bg-secondary200 text-white title-text px-4 py-2 rounded-md"
                onClick={() =>
                  setCurrentActionView(QuestActionView.SubmitUpdate)
                }
              >
                Submit Update
              </motion.button>
            )}
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
        </div>
      </ActionsCardBanner>
      <div className="">
        {update && currentBounty.isCreator && (
          <div className="px-5 pt-5">
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
          </div>
        )}
        {update && currentBounty.isApprovedSubmitter && (
          <div className="px-5 pt-5">
            <AlertCard
              type="positive"
              title="Nice!"
              description="Your update has been sent!"
            />
          </div>
        )}

        <ChannelProvider channelUrl={channel}>
          <div className="w-full h-[calc(44.5rem-68px)] flex flex-col justify-between">
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
