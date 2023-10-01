import { ChatButton, ContributorInfo } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { LancerApplyData } from "@/types";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { Dispatch, FC, SetStateAction } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import AlertCard from "./AlertCard";
import { QuestApplicationView } from "./LancerApplicationView";
import { QuestActionView } from "./QuestActions";

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

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner title="Apply to this Quest">
        {/* <ContributorInfo user={currentBounty.creator.user} /> */}
        {hasApplied &&
          currentBounty.isShortlistedLancer &&
          Number(currentBounty.escrow.amount) > 0 && (
            <ChatButton setCurrentActionView={setCurrentActionView} />
          )}
      </ActionsCardBanner>
      {hasApplied && !currentBounty.isShortlistedLancer && (
        <div className="px-5 pt-5">
          <AlertCard
            type="positive"
            title="Nice!"
            description="Your application has been sent. Fingers crossed! You will hear an answer from the client within 48 hours."
          />
        </div>
      )}
      {hasApplied && currentBounty.isShortlistedLancer && (
        <div className="px-5 pt-5">
          <AlertCard
            type="positive"
            title="Good news!"
            description="You have been added to the creator's shortlist. You can now chat with them to see if you're a good fit for each other!"
          />
        </div>
      )}
      {currentBounty.isDeniedLancer && (
        <div className="px-5 pt-5">
          <AlertCard
            type="negative"
            title="Not Selected"
            description="The creator of this Quest has decided to go with another Lancer. You can still apply to other Quests!"
          />
        </div>
      )}
      {!currentUser.hasBeenApproved && (
        <div className="px-5 pt-5">
          <AlertCard
            type="negative"
            title="Not Approved"
            description="You Must Be Approved to Apply to Quests"
          />
        </div>
      )}
      <div className="w-full p-6 flex items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <p className="text-neutral600 text">Portfolio</p>
          <input
            type="text"
            className="text border border-neutral200 placeholder:text-neutral500/60 
            bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
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
        <div className="flex items-center gap-4">
          <p className="text-neutral600 text">LinkedIn</p>
          <input
            type="text"
            className="text border border-neutral200 placeholder:text-neutral500/60 
            bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
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
      <div className="w-full px-6 py-4 flex flex-col gap-4">
        <p className="text-neutral600 text">Who am I?</p>
        <textarea
          className="text border border-neutral200 placeholder:text-neutral500/80 resize-none h-[232px]
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
          <button
            className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
            disabled={hasApplied || currentBounty.isDeniedLancer}
            onClick={() =>
              window.open(currentUser.resume, "_blank", "noopener noreferrer")
            }
          >
            <ImageIcon color="#A1B2AD" size={18} />
            <p className="text-xs text-neutral400 truncate">resume.pdf</p>
          </button>
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
