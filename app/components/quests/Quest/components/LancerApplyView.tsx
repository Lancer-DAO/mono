import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import { useBounty } from "@/src/providers/bountyProvider";
import { ChatButton } from "@/components";
import { useUserWallet } from "@/src/providers";
import { DEVNET_USDC_MINT, smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyState,
  LancerApplyData,
} from "@/types";
import AlertCard from "./AlertCard";
import { Image as ImageIcon } from "lucide-react";
import { useReferral } from "@/src/providers/referralProvider";
import { PublicKey } from "@solana/web3.js";
import { api, updateList } from "@/src/utils";
import toast from "react-hot-toast";
import { QuestActionView } from "./QuestActions";
import Image from "next/image";

interface Props {
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
}

const LancerApplyView: FC<Props> = ({ setCurrentActionView }) => {
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

  const applicationDisabled =
    currentBounty.isRequestedLancer ||
    currentBounty.isDeniedLancer ||
    currentBounty.isCreator ||
    (currentBounty.state !== BountyState.ACCEPTING_APPLICATIONS &&
      currentBounty.state !== BountyState.NEW);

  const onClick = async () => {
    // Request to submit. Does not interact on chain
    const toastId = toast.loading("Sending application...");
    try {
      await createReferralMember(
        // locally, need to add cevnet usdc mint
        new PublicKey(currentBounty.escrow.mint.publicKey)
      );
      const newRelations = updateList(
        currentBounty.currentUserRelationsList ?? [],
        [],
        [BOUNTY_USER_RELATIONSHIP.RequestedLancer]
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
    } catch (error) {
      console.log(error)
      if (
        (error.message as string).includes(
          "Wallet is registered to another user"
        )
      ) {
        toast.error("Wallet is registered to another user", { id: toastId });
      } else {
        toast.error("Error submitting application", { id: toastId });
      }
    }
  };

  useEffect(() => {
    if (currentBounty && currentBounty.isRequestedLancer) {
      // TODO: fetch user's application
    }
  }, [currentBounty]);

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col h-full">
      <ActionsCardBanner title="Apply to this Quest">
        {currentBounty.isShortlistedLancer ||
        currentBounty.currentSubmitter ||
        currentBounty.isCompleter ? (
          <ChatButton setCurrentActionView={setCurrentActionView} />
        ) : null}
      </ActionsCardBanner>
      {/* notification logic */}
      {currentBounty.isRequestedLancer && (
        <AlertCard
          type="positive"
          title="Nice!"
          description="Your application has been sent. Fingers crossed! You will hear an answer from the client within 48 hours."
        />
      )}
      {currentBounty.isDeniedLancer && (
        <AlertCard
          type="negative"
          title="Denied"
          description="Your application has been denied. You can still apply to other quests."
        />
      )}
      {currentBounty.state === BountyState.IN_PROGRESS &&
        !currentBounty.isApprovedSubmitter &&
        !currentBounty.isDeniedLancer && (
          <AlertCard
            type="neutral"
            title="Quest In Progress"
            description="This Quest is already in progress. You can apply to other quests."
          />
        )}
      {currentBounty.state === BountyState.COMPLETE &&
        !currentBounty.isCompleter && (
          <AlertCard
            type="neutral"
            title="Quest Complete"
            description="This Quest has already been completed. You can apply to other quests."
          />
        )}
      {currentBounty.state === BountyState.COMPLETE &&
        currentBounty.isCompleter && (
          <AlertCard
            type="positive"
            title="Wow! Congrats!"
            description="You have completed this Quest. It is now archived so you can always access the details of this project later on."
          />
        )}
      {currentBounty.state === BountyState.CANCELED &&
        currentBounty.users.some((user) => user.userid !== currentUser.id) && (
          <AlertCard
            type="neutral"
            title="Quest Canceled"
            description="This Quest has been canceled. You can apply to other Quests."
          />
        )}
      {applicationDisabled &&
      !currentBounty.isCompleter &&
      !currentBounty.isRequestedLancer ? (
        <div className="w-full h-[400px] flex flex-col items-center justify-center">
          <div className="w-32">
            <Image
              src="/assets/images/placeholder.png"
              width={419}
              height={351}
              alt="placeholder"
            />
          </div>
          <p className="text-neutral600 text">You cannot apply to this Quest</p>
        </div>
      ) : (
        <>
          <div className="w-full h-full p-6 flex items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <p className="text-neutral600 text">Portfolio</p>
              <input
                type="text"
                className="text border border-neutral200 placeholder:text-neutral500/60 
                bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
                name={`link-portfolio`}
                placeholder="Paste Link"
                id={`link-portfolio`}
                disabled={applicationDisabled}
                value={applyData.portfolio || currentUser.website}
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
                disabled={applicationDisabled}
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
              disabled={applicationDisabled}
              value={applyData.about}
              onChange={(e) =>
                setApplyData({ ...applyData, about: e.target.value })
              }
            />
            {/* TODO: resume upload - link brought from user object, can delete, can reupload */}
            <div className="flex items-center justify-end text text-neutral600">
              <button
                className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
                onClick={() => {
                  if (currentUser.resume) {
                    window.open(
                      currentUser.resume,
                      "_blank",
                      "noopener noreferrer"
                    );
                  } else {
                    toast.error("No resume uploaded");
                  }
                }}
              >
                <ImageIcon color="#A1B2AD" size={18} />
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
              disabled={applicationDisabled}
              value={applyData.details}
              onChange={(e) =>
                setApplyData({ ...applyData, details: e.target.value })
              }
            />
          </div>
          {!applicationDisabled && (
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
        </>
      )}
    </div>
  );
};

export default LancerApplyView;
