import { FC, useEffect, useState } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import { useBounty } from "@/src/providers/bountyProvider";
import { ContributorInfo } from "@/components";
import { useUserWallet } from "@/src/providers";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import { BOUNTY_USER_RELATIONSHIP, LancerApplyData } from "@/types";
import AlertCard from "./AlertCard";
import { Image } from "lucide-react";
import { useReferral } from "@/src/providers/referralProvider";
import { PublicKey } from "@solana/web3.js";
import { api, updateList } from "@/src/utils";
import toast from "react-hot-toast";

const LancerApplyView: FC = () => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { currentUser, currentWallet } = useUserWallet();
  const { createReferralMember } = useReferral();
  const { mutateAsync: updateBountyUsers } =
    api.bountyUsers.update.useMutation();

  const [applyData, setApplyData] = useState<LancerApplyData>({
    portfolio: currentUser.website,
    linkedin: currentUser.linkedin,
    about: currentUser.bio,
    resume: currentUser.resume,
    details: "",
  });
  const [hasApplied, setHasApplied] = useState(false);

  const onClick = async () => {
    // Request to submit. Does not interact on chain
    const toastId = toast.loading("Sending application...");
    try {
      await createReferralMember(
        new PublicKey(currentBounty.escrow.mint.publicKey)
      );
      const newRelations = updateList(
        currentBounty.currentUserRelationsList ?? [],
        [],
        [BOUNTY_USER_RELATIONSHIP.RequestedSubmitter]
      );
      const updatedBounty = await updateBountyUsers({
        currentUserId: currentUser.id,
        bountyId: currentBounty.id,
        userId: currentUser.id,
        relations: newRelations,
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty.escrowid,
        label: "request-to-submit",
        signature: "n/a",
        applicationText: applyData.details,
      });

      setCurrentBounty(updatedBounty);
      toast.success("Application sent", { id: toastId });
      // TODO: replace state variable with a db check for if user has applied
      setHasApplied(true);
    } catch (error) {
      toast.error("Error submitting application", { id: toastId });
    }
  };

  // check if user has applied
  useEffect(() => {
    if (!currentBounty || !currentUser) return;
    const hasApplied = currentBounty.currentUserRelationsList?.some(
      (relation) => relation === BOUNTY_USER_RELATIONSHIP.RequestedSubmitter
    );
    setHasApplied(hasApplied);
  }, [currentBounty, currentUser]);

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner title="Apply to this Quest">
        <ContributorInfo user={currentBounty.creator.user} />
      </ActionsCardBanner>
      {/* TODO: add check for if user application has been approved or denied. if not, show this: */}
      {hasApplied && (
        <AlertCard
          type="positive"
          title="Nice!"
          description="Your application has been sent. Fingers crossed! You will hear an answer from the client within 48 hours."
        />
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
            disabled={hasApplied}
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
            disabled={hasApplied}
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
          disabled={hasApplied}
          value={applyData.about}
          onChange={(e) =>
            setApplyData({ ...applyData, about: e.target.value })
          }
        />
        {/* TODO: resume upload - link brought from user object, can delete, can reupload */}
        <div className="flex items-center justify-end text text-neutral600">
          <button
            className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
            disabled={hasApplied}
            onClick={() =>
              window.open(currentUser.resume, "_blank", "noopener noreferrer")
            }
          >
            <Image color="#A1B2AD" size={18} />
            <p className="text-xs text-neutral400 truncate">resume.pdf</p>
          </button>
        </div>
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      <div className="w-full px-6 py-4 flex flex-col gap-4">
        <p className="text-neutral-600 text">Why am I a good fit?</p>
        <textarea
          className="text border border-neutral200 placeholder:text-neutral500/80 resize-none h-[232px]
          bg-neutral100 text-neutral500 w-full rounded-md px-3 p-2 disabled:opacity-60"
          name={`details`}
          placeholder="Type your message here..."
          id={`details`}
          disabled={hasApplied}
          value={applyData.details}
          onChange={(e) =>
            setApplyData({ ...applyData, details: e.target.value })
          }
        />
      </div>
      {!hasApplied && (
        <div className="flex items-center justify-end px-6 py-4">
          <motion.button
            {...smallClickAnimation}
            className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text rounded-md"
            onClick={onClick}
          >
            Submit Application
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default LancerApplyView;
