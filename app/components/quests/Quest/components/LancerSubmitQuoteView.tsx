import Plus from "@/components/@icons/Plus";
import RedFire from "@/components/@icons/RedFire";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import {
  QuestActionView,
  QuestApplicationView,
  useBounty,
} from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { BountyState, LancerQuoteData } from "@/types";
import { motion } from "framer-motion";
import { Dispatch, FC, SetStateAction, useEffect } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import AlertCards from "./AlertCards";
import CheckpointEdit from "./CheckpointEdit";
import CheckpointView from "./CheckpointView";
import { X } from "lucide-react";
interface Props {
  quoteData: LancerQuoteData;
  setQuoteData: Dispatch<SetStateAction<LancerQuoteData>>;
  setCurrentApplicationView: Dispatch<SetStateAction<QuestApplicationView>>;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  onClick: () => Promise<void>;
  isAwaitingResponse: boolean;
}

const LancerSubmitQuoteView: FC<Props> = ({
  quoteData,
  setQuoteData,
  setCurrentApplicationView,
  setCurrentActionView,
  onClick,
  isAwaitingResponse,
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

  const quoteIsValid =
    currentUser.hasBeenApproved &&
    quoteData.checkpoints.length > 0 &&
    quoteData.checkpoints[0].title !== "" &&
    quoteData.checkpoints[0].description !== "" &&
    quoteData.checkpoints[0].price !== 0 &&
    quoteData.checkpoints[0].estimatedTime !== 0;

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
        title={!!quote ? "Your Quote" : "Submit Quote"}
        subtitle="Quest Application"
      >
        <div className="flex items-center gap-3">
          <motion.button
            {...smallClickAnimation}
            onClick={() => {
              setCurrentActionView(QuestActionView.Chat);
            }}
          >
            <X color="white" />
          </motion.button>
        </div>
      </ActionsCardBanner>
      <AlertCards />
      <div className="relative flex flex-col flex-1 h-full">
        <div className="px-6 py-4">
          {quoteData.checkpoints.map((checkpoint, index) => (
            <>
              {!quote && !currentBounty.isDeniedLancer ? (
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
          {quoteData.checkpoints.length < 5 && !quote && (
            <div className="py-4">
              <button
                className="py-1 px-2 flex gap-1 justify-center items-center hover:bg-neutral100
                rounded-md border border-neutral300 text-sm text-neutral600"
                onClick={() => addCheckpoint()}
              >
                <Plus />
                Add a Milestone
              </button>
            </div>
          )}
          <div className="flex py-4 justify-between">
            <div className="flex items-center gap-2">
              <RedFire />
              <div className="title-text text-neutral600">
                Total Quote Price
              </div>
              <div className="w-[1px] h-5 bg-neutral200" />
              <div className="text-mini text-neutral400">{`${quoteData.estimatedTime}h`}</div>
            </div>
            <div className="flex items-center title-text text-primary200">{`$${quoteData.price}`}</div>
          </div>
        </div>
        {currentBounty.isRequestedLancer && !quote && (
          <div className="mt-auto self-stretch">
            <div className="h-[1px] w-full bg-neutral200" />
            <div className="flex py-4 px-6 justify-end mt-auto items-center gap-4 self-stretch opacity-100">
              <motion.button
                {...smallClickAnimation}
                className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text rounded-md
                disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={onClick}
                disabled={isAwaitingResponse || !quoteIsValid}
              >
                Send Quote
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LancerSubmitQuoteView;
