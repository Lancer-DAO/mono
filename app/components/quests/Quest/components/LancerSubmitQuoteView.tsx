import Plus from "@/components/@icons/Plus";
import RedFire from "@/components/@icons/RedFire";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { Checkpoint, LancerQuoteData, QuestProgressState } from "@/types";
import { Dispatch, FC, SetStateAction, useState } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import { default as CheckpointView, default as MilestoneView } from "./CheckpointView";
import { QuestActionView } from "./QuestActions";

interface Props {
  quoteData: LancerQuoteData,
  setQuoteData: Dispatch<SetStateAction<LancerQuoteData>>,
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>,
}

const LancerSubmitQuoteView: FC<Props> = ({ quoteData, setQuoteData, setCurrentActionView }) => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();
  const { data: quotes } = api.quote.getQuotesByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );

  const addCheckpoint = () => {
    const newCheckpoint = {
      title: "",
      price: 0,
      description: "",
      estimatedTime: 0,
      detailsOpen: true,
      canEdit: true,
    };
    
    setQuoteData({
      ...quoteData, 
      checkpoints: [...quoteData.checkpoints.map((checkpoint, i) => {
        const changedCheckpoint = checkpoint;
        changedCheckpoint.detailsOpen = false;
        changedCheckpoint.canEdit = false;
        return changedCheckpoint;
      }), newCheckpoint]
    });
  };

  const closeAllExceptOne = (index: number) => {
    const newCheckpoints = quoteData.checkpoints.map((checkpoint, i) => {
      if (i === index) {
        return { ...checkpoint, detailsOpen: true, canEdit: true };
      } else {
        return { ...checkpoint, detailsOpen: false, canEdit: false };
      }
    });
    setQuoteData({ ...quoteData, checkpoints: newCheckpoints });
  };

  const closeDetailsAndEdit = (index: number) => {
    const newCheckpoints = quoteData.checkpoints;
    newCheckpoints[index] = { ...newCheckpoints[index], detailsOpen: false, canEdit: false };
    setQuoteData({ ...quoteData, checkpoints: newCheckpoints });
  };

  const setDetails = (index: number) => {
    const newCheckpoints = [...quoteData.checkpoints];
    newCheckpoints[index] = { ...newCheckpoints[index], detailsOpen: !newCheckpoints[index].detailsOpen };
    setQuoteData({ ...quoteData, checkpoints: newCheckpoints });
  };

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Quote to ${currentBounty.creator.user.name}`}
        subtitle={`${quotes?.length || 0} ${
          (quotes?.length || 0) === 1 ? "quote" : "quotes"
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
            closeAllExceptOne={closeAllExceptOne}
            closeDetailsAndEdit={closeDetailsAndEdit}
            setDetails={setDetails}
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
              Add a Checkpoint
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
