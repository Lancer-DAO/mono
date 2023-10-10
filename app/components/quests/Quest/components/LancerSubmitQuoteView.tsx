import Plus from "@/components/@icons/Plus";
import RedFire from "@/components/@icons/RedFire";
import { user } from "@/prisma/queries";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { BountyState, LancerQuoteData } from "@/types";
import { motion } from "framer-motion";
import { Dispatch, FC, SetStateAction, useEffect } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import AlertCards from "./AlertCards";
import CheckpointEdit from "./CheckpointEdit";
import CheckpointView from "./CheckpointView";
import { QuestApplicationView } from "./LancerApplicationView";
import { ChatButton } from "@/components";
import { QuestActionView } from "./QuestActions";
interface Props {
  quoteData: LancerQuoteData;
  setQuoteData: Dispatch<SetStateAction<LancerQuoteData>>;
  setCurrentApplicationView: Dispatch<SetStateAction<QuestApplicationView>>;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  hasApplied: boolean;
  onClick: () => Promise<void>;
  isAwaitingResponse: boolean;
  applicationIsValid: boolean;
}

const LancerSubmitQuoteView: FC<Props> = ({
  quoteData,
  setQuoteData,
  setCurrentApplicationView,
  setCurrentActionView,
  hasApplied,
  onClick,
  isAwaitingResponse,
  applicationIsValid,
}) => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();
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
  const { data: update } = api.update.getNewUpdateByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );

  useEffect(() => {
    if (!!quote && !!checkpoints) {
      setQuoteData({
        ...quoteData,
        price: Number(quote.price),
        estimatedTime: Number(quote.estimatedTime),
        checkpoints: checkpoints.map((checkpoint) => {
          return {
            title: checkpoint.title,
            description: checkpoint.description,
            price: Number(checkpoint.price),
            estimatedTime: Number(checkpoint.estimatedTime),
            detailsOpen: false,
            canEdit: false,
            addedWen: 0,
          };
        }),
      });
    }
  }, [quote, checkpoints]);

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
      checkpoints: [
        ...quoteData.checkpoints.map((checkpoint, i) => {
          const changedCheckpoint = checkpoint;
          changedCheckpoint.detailsOpen = false;
          changedCheckpoint.canEdit = false;
          return changedCheckpoint;
        }),
        newCheckpoint,
      ],
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
    newCheckpoints[index] = {
      ...newCheckpoints[index],
      detailsOpen: false,
      canEdit: false,
    };
    setQuoteData({ ...quoteData, checkpoints: newCheckpoints });
  };

  const setDetails = (index: number) => {
    const newCheckpoints = [...quoteData.checkpoints];
    newCheckpoints[index] = {
      ...newCheckpoints[index],
      detailsOpen: !newCheckpoints[index].detailsOpen,
    };
    setQuoteData({ ...quoteData, checkpoints: newCheckpoints });
  };

  useEffect(() => {
    if (quoteData.checkpoints.length === 0) addCheckpoint();
  }, []);

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col relative h-full">
      <ActionsCardBanner
        title={`Submit Quote`}
        subtitle="Quest Application"
        // subtitle={`${quotes?.length || 0} ${
        //   (quotes?.length || 0) === 1 ? "quote has" : "quotes have"
        // } been sent to them already`}
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
          {currentBounty.isShortlistedLancer &&
            Number(currentBounty.escrow.amount) > 0 && (
              <ChatButton setCurrentActionView={setCurrentActionView} />
            )}
        </div>
      </ActionsCardBanner>
      <AlertCards />
      <div className="relative flex flex-col flex-1 h-full">
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
              {!hasApplied && !currentBounty.isDeniedLancer ? (
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
          {quoteData.checkpoints.length < 5 && !hasApplied && (
            <div className="py-4">
              <button
                className="py-1 px-2 flex gap-1 justify-center items-center 
                rounded-md border border-neutral200 text-mini text-neutral500"
                onClick={() => addCheckpoint()}
              >
                <Plus />
                Add a Milestone
              </button>
            </div>
          )}
        </div>
        <div className="flex py-4 px-6 justify-end mt-auto items-center gap-4 self-stretch opacity-100">
          <button
            className="title-text text-neutral600 px-4 py-2 rounded-md border 
            border-neutral300"
            onClick={() =>
              setCurrentApplicationView(QuestApplicationView.ProfileInfo)
            }
          >
            Application Details
          </button>
          {!hasApplied && !currentBounty.isDeniedLancer && (
            <motion.button
              {...smallClickAnimation}
              className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text rounded-md
              disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={onClick}
              disabled={isAwaitingResponse || !applicationIsValid}
            >
              Submit Application
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LancerSubmitQuoteView;
