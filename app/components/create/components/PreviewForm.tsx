import { FC, useState, Dispatch, SetStateAction, useEffect } from "react";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import {
  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE,
  IS_MAINNET,
  smallClickAnimation,
} from "@/src/constants";
import { FORM_SECTION, FormData } from "@/types/forms";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { motion } from "framer-motion";
import { PreviewCardBase, BountyCard, USDC } from "@/components";
import { PublicKey } from "@solana/web3.js";
import { createFFA } from "@/escrow/adapters";
import { api } from "@/utils";
import { Bounty, IAsyncResult, Industry } from "@/types";
import { Mint } from "@prisma/client";
import { useReferral } from "@/src/providers/referralProvider";
import toast from "react-hot-toast";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  industries: Industry[];
  createAccountPoll: (publicKey: PublicKey) => void;
  handleChange: (event) => void;
  mint: Mint;
}

export const PreviewForm: FC<Props> = ({
  setFormSection,
  formData,
  industries,
  createAccountPoll,
  handleChange,
  mint,
}) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bounties.createBounty.useMutation();
  const { getRemainingAccounts, getSubmitterReferrer } = useReferral();
  const [createQuestState, setCreateQuestState] = useState<
    IAsyncResult<string>
  >({ isLoading: false });

  const createBounty = async () => {
    if (!currentWallet?.publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    setCreateQuestState({ isLoading: true, loadingPrompt: "Creating Quest" });
    try {
      if (
        currentTutorialState?.title ===
          CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
        currentTutorialState.currentStep === 5
      ) {
        setCurrentTutorialState({
          ...currentTutorialState,
          isRunning: false,
        });
      }

      const mintKey = new PublicKey(mint?.publicKey);

      const remainingAccounts = await getRemainingAccounts(
        currentWallet.publicKey,
        mintKey
      );

      const { timestamp, signature, escrowKey } = await createFFA(
        currentWallet,
        program,
        provider,
        await getSubmitterReferrer(currentWallet.publicKey, mintKey),
        remainingAccounts,
        mintKey
      );
      createAccountPoll(escrowKey);
      const bounty: Bounty = await mutateAsync({
        email: currentUser.email,
        industryIds: [formData.industryId],
        disciplineIds: formData.displineIds,
        title: formData.issueTitle,
        description: formData.issueDescription,
        tags: formData.tags,
        links: formData.links,
        media: formData.media,
        estimatedTime: parseFloat(formData.estimatedTime),
        isPrivate: formData.isPrivate,
        // isPrivateRepo: formData.isPrivate || repo ? repo.private : false,
        publicKey: currentWallet.publicKey.toString(),
        escrowKey: escrowKey.toString(),
        transactionSignature: signature,
        timestamp: timestamp,
        chainName: "Solana",
        mint: mint.id,
        network: IS_MAINNET ? "mainnet" : "devnet",
      });

      setFormSection("FUND");
      setCurrentBounty(bounty);
    } catch (error) {
      setCreateQuestState({ error });
    }
  };

  return (
    <div className="px-10">
      <h1>Preview</h1>
      <div className="w-full flex flex-col gap-4 my-6">
        <p className="max-w-[500px]">
          This is your chance to make sure everything looks right. The more
          fleshed out your quest is, the better your chances of finding a match!
        </p>

        <div className="w-full flex items-center gap-10">
          {/* two cards in view */}
          {/* 1. preview card */}
          <PreviewCardBase title="Quest">
            <BountyCard
              formData={formData}
              linked={false}
              allIndustries={industries}
            />
          </PreviewCardBase>
          {/* 2. quest links card */}
          <PreviewCardBase title="Links">
            <div className="flex flex-col gap-4 overflow-hidden">
              {formData?.links.length > 0 && formData?.links[0] !== "" ? (
                formData?.links?.map((link, index) => {
                  const formattedLink =
                    link.startsWith("http://") || link.startsWith("https://")
                      ? link
                      : `http://${link}`;
                  return (
                    <a
                      key={index}
                      href={formattedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate bg-white p-3 border border-neutralBtnBorder
                      rounded-lg text-textGreen text-base"
                    >
                      {formattedLink}
                    </a>
                  );
                })
              ) : (
                <p
                  className="bg-white p-3 border border-neutralBtnBorder
                  rounded-lg text-textGreen text-base"
                >
                  No links provided!
                </p>
              )}
            </div>
          </PreviewCardBase>
        </div>

        <div className="w-full px-10 my-4 flex items-center justify-between">
          <motion.button
            {...smallClickAnimation}
            onClick={() => setFormSection("MEDIA")}
            className="bg-secondaryBtn border border-secondaryBtnBorder text-textRed 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            BACK
          </motion.button>
          <motion.button
            {...smallClickAnimation}
            onClick={() => createBounty()}
            className={`border h-[50px] rounded-lg text-base ${
              createQuestState.error
                ? "w-[250px] bg-secondaryBtn border-secondaryBtnBorder text-textRed"
                : "w-[150px] bg-primaryBtn border-primaryBtnBorder text-textGreen"
            } `}
          >
            {createQuestState.error
              ? "Failed to Create Quest"
              : createQuestState.isLoading
              ? createQuestState.loadingPrompt
              : "CONTINUE"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
