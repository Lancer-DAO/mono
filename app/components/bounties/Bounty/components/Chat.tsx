import { Bounty, User } from "@prisma/client";
import dayjs from "dayjs";
import { Dispatch, FC, SetStateAction } from "react";
import { QuestActionView } from "./QuestActions";

const Chat: FC<{
  bounty: Bounty,
  client: User,
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>,
}> = ({ bounty, client, setCurrentActionView }) => {
  return (
    <div className="flex flex-col shrink-0 rounded-lg bg-white w-[610px] h-[717px] border border-neutral200">
      {/* card header */}
      <div className="flex justify-between bg-secondary300 px-6 py-4 gap-1 rounded-t-lg">
        <div className="flex flex-col text-white">
          <div className="titleText">{`Conversation with ${client.name}`}</div>
          <div className="text-mini opacity-60">{`Started on ${dayjs.unix(parseInt(bounty.createdAt) / 1000).format("ddd D MMM YYYY")}`}</div>
        </div>
        <button 
          className="rounded-md px-4 py-2 titleText text-white bg-primary200"
          onClick={() => setCurrentActionView(QuestActionView.SubmitQuote)}
        >
          Create Quote
        </button>
      </div>
      {/* content */}
      <div className="flex flex-col flex-1 self-stretch h-full px-6 py-4 gap-4">
      
      </div>
    </div>
  )
}

export default Chat;