import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { ChatButton } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { LancerApplyData } from "@/types";
import { motion } from "framer-motion";
import ActionsCardBanner from "./ActionsCardBanner";
import { QuestApplicationView } from "./LancerApplicationView";
import { QuestActionView } from "./QuestActions";
import AlertCards from "./AlertCards";
import { ResumeCard } from "@/components/account/components";

interface Props {
  applyData: LancerApplyData;
  setApplyData: Dispatch<SetStateAction<LancerApplyData>>;
  setCurrentApplicationView: Dispatch<SetStateAction<QuestApplicationView>>;
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  hasApplied: boolean;
  onClick: () => Promise<void>;
  isAwaitingResponse: boolean;
  applicationIsValid: boolean;
}

const LancerApplyView: FC<Props> = ({
  applyData,
  setApplyData,
  setCurrentApplicationView,
  setCurrentActionView,
  hasApplied,
  onClick,
  isAwaitingResponse,
  applicationIsValid,
}) => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();
  const [resumeUrl, setResumeUrl] = useState<string>();

  useEffect(() => {
    if (!currentUser) return;
    setResumeUrl(currentUser.resume);
  }, [currentUser]);

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col h-full">
      <ActionsCardBanner
        title={"Your Details"}
        subtitle="Quest Application"
        // subtitle={
        //   hasApplied
        //     ? `${quotes?.length || 0} ${
        //         (quotes?.length || 0) === 1 ? "quote has" : "quotes have"
        //       } been sent to them already`
        //     : ""
        // }
      >
        {hasApplied &&
          currentBounty.isShortlistedLancer &&
          Number(currentBounty.escrow.amount) > 0 && (
            <ChatButton setCurrentActionView={setCurrentActionView} />
          )}
      </ActionsCardBanner>
      <AlertCards />
      <div className="w-full p-6 flex items-center justify-between gap-6">
        <div className="w-full flex items-center gap-4">
          <p className="text-neutral600 text">Portfolio</p>
          <input
            type="text"
            className="text border border-neutral200 placeholder:text-neutral500/60 
              bg-neutral100 text-neutral500 w-full h-[34px] rounded-md px-3"
            name={`link-portfolio`}
            placeholder="Paste Link"
            id={`link-portfolio`}
            disabled={hasApplied || currentBounty.isDeniedLancer}
            value={applyData.portfolio}
            onChange={(e) =>
              setApplyData({ ...applyData, portfolio: e.target.value })
            }
          />
        </div>
        <div className="w-full flex items-center gap-4">
          <p className="text-neutral600 text">LinkedIn</p>
          <input
            type="text"
            className="text border border-neutral200 placeholder:text-neutral500/60 
            bg-neutral100 text-neutral500 w-full h-[34px] rounded-md px-3"
            name={`link-linkedin`}
            placeholder="Paste Link"
            id={`link-linkedin`}
            disabled={hasApplied || currentBounty.isDeniedLancer}
            value={applyData.linkedin}
            onChange={(e) =>
              setApplyData({ ...applyData, linkedin: e.target.value })
            }
          />
        </div>
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      <div className="w-full flex-1 px-6 py-4 flex flex-col gap-4">
        <p className="text-neutral600 text">Who am I?</p>
        <textarea
          className="text border border-neutral200 placeholder:text-neutral500/80 resize-y min-h-[150px] max-h-[500px] overflow-y-auto
          bg-neutral100 text-neutral500 w-full rounded-md px-3 p-2 disabled:opacity-60"
          name={`about`}
          placeholder="Tell us about yourself"
          id={`about`}
          disabled={hasApplied || currentBounty.isDeniedLancer}
          value={applyData.about}
          onChange={(e) =>
            setApplyData({ ...applyData, about: e.target.value })
          }
        />
        <div className="flex items-center justify-end text text-neutral600">
          <ResumeCard
            resumeUrl={resumeUrl}
            editing={!hasApplied}
            setResumeUrl={setResumeUrl}
          />
        </div>
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      <div className="flex items-center justify-end gap-4 px-6 py-4">
        <button
          className="title-text text-neutral600 px-4 py-2 rounded-md border border-neutral300"
          onClick={() =>
            setCurrentApplicationView(QuestApplicationView.SubmitQuote)
          }
        >
          Back to Quote
        </button>
        {!hasApplied && (
          <motion.button
            {...smallClickAnimation}
            className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text 
            rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={onClick}
            disabled={isAwaitingResponse || !applicationIsValid}
          >
            Submit Application
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default LancerApplyView;
