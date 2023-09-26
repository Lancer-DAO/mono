import Plus from "@/components/@icons/Plus";
import RedFire from "@/components/@icons/RedFire";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { Checkpoint, LancerQuoteData, QuestProgressState } from "@/types";
import { motion } from "framer-motion";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { toast } from "react-hot-toast";
import ActionsCardBanner from "./ActionsCardBanner";
import { default as CheckpointView, default as MilestoneView } from "./CheckpointView";
import { QuestActionView } from "./QuestActions";

interface Props {
  quoteData: LancerQuoteData,
  setQuoteData: Dispatch<SetStateAction<LancerQuoteData>>,
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>,
}

const LancerSubmitQuoteView: FC<Props> = ({ quoteData, setQuoteData, setCurrentActionView }) => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();

  const addCheckpoint = () => {
    const newCheckpoint = {
      title: "",
      price: 0,
      description: "",
      estimatedTime: 0,
    };

    setQuoteData({ ...quoteData, checkpoints: [...quoteData.checkpoints, newCheckpoint]});
  };

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Quote to ${currentBounty.creator.user.name}`}
        subtitle={`${quoteData.checkpoints.length || 0} ${
          (quoteData.checkpoints.length || 0) === 1 ? "quote" : "quotes"
        } have been sent to them already`}
      ></ActionsCardBanner>
      <div className="px-6 py-4">
        <div className="flex py-4 justify-between border-b border-neutral200">
          <div className="flex items-center gap-2">
            <RedFire />
            <div className="title-text text-neutral600">Quote Price</div>
            <div className="w-[1px] h-5 bg-neutral200" />
            <div className="text-mini text-neutral400">{`${quoteData.estimatedTime}h`}</div>
          </div>
          <div className="flex items-center title-text text-primary200">{`$${quoteData.price}`}</div>
        </div>
        {quoteData.checkpoints.map((checkpoint, index) => (
          <CheckpointView
            checkpoint={checkpoint} 
            setQuoteData={setQuoteData} 
            index={index}
            key={index} 
          />
        ))}
        {quoteData.checkpoints.length < 5 && (
          <div className="py-4">
            <button 
              className="py-1 px-2 flex gap-1 justify-center items-center rounded-md border border-neutral200 text-mini text-neutral500"
              onClick={() => addCheckpoint()}
            >
              <Plus /> 
              Add a Milestone
            </button>
          </div>

        )}
      </div>
      <div className="flex py-4 px-6 justify-end items-center gap-4 self-stretch opacity-100">
        <button 
          className="px-4 py-2 text-neutral600 title-text rounded-md border border-neutral300"
        >
          Cancel
        </button>
        <button 
          className="px-4 py-2 text-white title-text rounded-md bg-secondary200"
          onClick={() => setCurrentActionView(QuestActionView.Apply)}
        >
            Review Profile
        </button>
      </div>
    </div>
  );
};

export default LancerSubmitQuoteView;
