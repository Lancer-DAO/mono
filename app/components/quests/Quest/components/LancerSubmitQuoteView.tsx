import Plus from "@/components/@icons/Plus";
import RedFire from "@/components/@icons/RedFire";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { LancerQuoteData } from "@/types";
import { motion } from "framer-motion";
import { Dispatch, FC, SetStateAction, useEffect } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import AlertCard from "./AlertCard";
import CheckpointEdit from "./CheckpointEdit";
import CheckpointView from "./CheckpointView";
import { QuestApplicationView } from "./LancerApplicationView";
interface Props {
  quoteData: LancerQuoteData,
  setQuoteData: Dispatch<SetStateAction<LancerQuoteData>>,
  setCurrentApplicationView: Dispatch<SetStateAction<QuestApplicationView>>,
  hasApplied: boolean,
  onClick: () => Promise<void>,
}

const LancerSubmitQuoteView: FC<Props> = ({ 
  quoteData, 
  setQuoteData, 
  setCurrentApplicationView, 
  hasApplied, 
  onClick 
}) => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();
  const { data: quotes } = api.quote.getQuotesByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty },
  )
  const { data: quote } = api.quote.getQuoteByBountyAndUser.useQuery(
    { 
      bountyId: currentBounty.id,
      userId: currentUser.id,
    },
    { enabled: !!currentBounty && !!currentUser }
  );
  const { data: checkpoints } = api.checkpoint.getCheckpointsByQuote.useQuery(
    { id: quote?.id },
    { enabled: !!quote }
  );

  useEffect(() => {
    if(!!quote && !!checkpoints) {
      setQuoteData({ ...quoteData, price: Number(quote.price), estimatedTime: Number(quote.estimatedTime), checkpoints: checkpoints.map((checkpoint) => { return {
        title: checkpoint.title,
        description: checkpoint.description,
        price: Number(checkpoint.price),
        estimatedTime: Number(checkpoint.estimatedTime),
        detailsOpen: false,
        canEdit: false,
        addedWen: 0
      }}) })
    }
    
  }, [quoteData, setQuoteData, quote, checkpoints])
  

  const addCheckpoint = () => {
    const newCheckpoint = {
      title: "",
      price: 0,
      description: "",
      estimatedTime: 0,
      detailsOpen: true,
      canEdit: true,
      addedWen: +new Date(),
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
      {/* TODO: add check for if user application has been approved or denied. if not, show this: */}
      {hasApplied && (
        <div className="px-5 pt-5">
          <AlertCard
            type="positive"
            title="Nice!"
            description="Your application has been sent. Fingers crossed! You will hear an answer from the client within 48 hours."
          />
        </div>
      )}
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
          <>
            {!hasApplied ? (
              <CheckpointEdit
                checkpoint={checkpoint} 
                setQuoteData={setQuoteData} 
                index={index}
                closeAllExceptOne={closeAllExceptOne}
                closeDetailsAndEdit={closeDetailsAndEdit}
                setDetails={setDetails}
                key={checkpoint.addedWen} 
              />
            ) : (
              <CheckpointView
                checkpoint={checkpoint}
                key={checkpoint.addedWen}
              />
            )} 
          </>
        ))}
        {(quoteData.checkpoints.length < 5 && !hasApplied) && (
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
          className="title-text text-neutral600 px-4 py-2 rounded-md border border-neutral300"
          onClick={() => setCurrentApplicationView(QuestApplicationView.ProfileInfo)}
        >
          Review Profile
        </button>
        {!hasApplied && (
          <motion.button
            {...smallClickAnimation}
            className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text rounded-md"
            onClick={onClick}
          >
            Submit Application
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default LancerSubmitQuoteView;
