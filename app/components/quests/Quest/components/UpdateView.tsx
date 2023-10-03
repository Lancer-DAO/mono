import Crown from "@/components/@icons/Crown";
import { BountyUserType } from "@/prisma/queries/bounty";
import { smallClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";
import { QuestProgressState } from "@/types";
import { oembed, validate } from "@loomhq/loom-embed";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ActionsCardBanner from "./ActionsCardBanner";
import { UPDATE_TYPES } from "./LancerSubmitUpdateView";
import { QuestActionView } from "./QuestActions";

interface Props {
  selectedSubmitter: BountyUserType | null;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const UpdateView: FC<Props> = ({ selectedSubmitter, setCurrentActionView }) => {
  const { currentBounty } = useBounty();

  const [videoHTML, setVideoHTML] = useState("");
  const [review, setReview] = useState(() => {
    const savedReviewData = localStorage.getItem("reviewData");
    if (savedReviewData) return JSON.parse(savedReviewData);

    return "";
  });
  const [hasSent, setHasSent] = useState(false);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const { data: updates } = api.update.getUpdatesByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );
  const { data: update } = api.update.getNewUpdateByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );
  const { data: media } = api.media.getMediaByUpdate.useQuery(
    { id: update?.id },
    { enabled: !!update }
  );
  const { mutateAsync: submitReview } = api.update.submitReview.useMutation();

  const confirmAction = (state: QuestProgressState): Promise<void> => {
    setIsAwaitingResponse(true);

    return new Promise<void>((resolve, reject) => {
      const handleYes = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        resolve();
      };

      const handleNo = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        reject();
      };

      const toastId = toast(
        (t) => (
          <div>
            {`Are you sure you want to ${
              state === QuestProgressState.ACCEPTED ? "approve" : "reject"
            } this update?`}
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="bg-primary200 text-white flex title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="bg-white border border-neutral300 flex text-error title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });
  };

  const onClick = async (updateState: QuestProgressState) => {
    if (review === "") {
      toast.error("Please provide some feedback.");
      return;
    }
    await confirmAction(updateState);
    const toastId = toast.loading(
      `${
        updateState === QuestProgressState.ACCEPTED ? "Approving" : "Rejecting"
      } update...`
    );
    try {
      await submitReview({
        id: update?.id,
        review: review,
        state: updateState,
        bountyId: currentBounty.id,
      });

      setHasSent(true);
      toast.success(
        `Update has been ${
          updateState === QuestProgressState.ACCEPTED ? "approved" : "rejected"
        }`,
        { id: toastId }
      );
      setTimeout(() => {
        toast.dismiss(toastId);
      }, 2000);
      localStorage.removeItem("reviewData");
    } catch (error) {
      toast.error("Error sending feedback", { id: toastId });
    }
  };

  const isVideo = (url: string) => {
    return url.includes(".mp4") || url.includes(".mov");
  };

  const setupLoom = async () => {
    const { html } = await oembed(update?.links);
    setVideoHTML(html);
  };

  if (validate.isLoomUrl(update?.links)) {
    setupLoom();
  }

  useEffect(() => {
    localStorage.setItem("reviewData", JSON.stringify(review));
  }, [review]);
  return (
    <div className="flex flex-col">
      <ActionsCardBanner
        title={`Update from ${currentBounty?.approvedSubmitters[0].user?.name}`}
        subtitle={`${updates?.length || 0} ${
          (updates?.length || 0) === 1 ? "update" : "updates"
        } so far`}
      >
        {currentBounty.isCreator && (
          <motion.button
            onClick={() => {
              setCurrentActionView(QuestActionView.Chat);
            }}
            {...smallClickAnimation}
          >
            <X height={24} width={24} className="text-white" />
          </motion.button>
        )}
      </ActionsCardBanner>
      <div className="w-full flex flex-col px-6 py-4 gap-6">
        {update?.type === UPDATE_TYPES.Loom && (
          <div className="w-full flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <p className="whitespace-nowrap text-neutral600 text">
                Loom Link
              </p>
              <div
                className="w-fit flex items-center text border border-neutral200 placeholder:text-neutral500/60 
                bg-neutral100 text-neutral500 h-[34px] rounded-md px-3 overflow-hidden"
              >
                {update?.links}
              </div>
            </div>
            {validate.isLoomUrl(update?.links) === false && (
              <div className="flex justify-center items-center rounded-md border px-[151px] py-[33px] h-[228px]">
                <div className="py-[10px] flex flex-col items-center gap-2">
                  <Crown />
                  <div className="text-mini text-neutral400 text-center">
                    The Lancer sent an invalid Loom link.
                  </div>
                </div>
              </div>
            )}
            {validate.isLoomUrl(update?.links) && (
              <div dangerouslySetInnerHTML={{ __html: videoHTML }}></div>
            )}
          </div>
        )}
        {update?.type === UPDATE_TYPES.FileUpload && (
          <div className="w-full flex justify-center">
            {media && media[0] && (
              <>
                {isVideo(media[0]?.imageUrl) ? (
                  <video controls>
                    <source src={media[0]?.imageUrl} />
                  </video>
                ) : (
                  <Image
                    src={media[0]?.imageUrl}
                    alt={`${update?.name} image`}
                    width={610}
                    height={228}
                  />
                )}
              </>
            )}
          </div>
        )}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <p className="whitespace-nowrap text-neutral600 text">Name</p>
            <div
              className="min-w-[190px] w-fit flex items-center text border border-neutral200 placeholder:text-neutral500/60 
                bg-neutral100 text-neutral500 h-[34px] rounded-md px-3 overflow-hidden"
            >
              {update?.name}
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="whitespace-nowrap text-neutral600 text">
              Description
            </p>
            <div
              className="flex text border border-neutral200 placeholder:text-neutral500/60 
                bg-neutral100 text-neutral500 rounded-md px-3 py-2 overflow-hidden"
            >
              {update?.description}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="text text-neutral600">
            Leave actionable feedback please. It will save time!
          </div>
          <textarea
            className="p-4 min-h-[132px] rounded-md border border-neutral200 bg-neutral100 text placeholder:text-neutral300 resize-none outline-none"
            placeholder="Type here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>
      </div>
      {!hasSent && (
        <div className="flex justify-end items-center gap-4 px-6 py-4">
          <motion.button
            {...smallClickAnimation}
            className="bg-white px-4 py-2 rounded-md border border-neutral200 title-text text-neutral600"
            onClick={() => onClick(QuestProgressState.REJECTED)}
            disabled={isAwaitingResponse}
          >
            Request Changes
          </motion.button>
          <motion.button
            {...smallClickAnimation}
            className="bg-primary200 px-4 py-2 rounded-md text-white title-text"
            value={QuestProgressState.ACCEPTED}
            onClick={() => onClick(QuestProgressState.ACCEPTED)}
            disabled={isAwaitingResponse}
          >
            Approve
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default UpdateView;
