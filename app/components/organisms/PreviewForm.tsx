import { FC, useState, Dispatch, SetStateAction, useEffect } from "react";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import {
  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE,
  IS_MAINNET,
  smallClickAnimation,
} from "@/src/constants";
import * as Prisma from "@prisma/client";
import { FORM_SECTION, FormData } from "@/types/forms";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { motion } from "framer-motion";
import { PreviewCardBase, Toggle } from "@/components";
import { ToggleConfig } from "../molecules/Toggle";
import { PublicKey } from "@solana/web3.js";
import { createFFA } from "@/escrow/adapters";
import { api } from "@/utils";
import { Bounty } from "@/types";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  createAccountPoll: (publicKey: PublicKey) => void;
}

const PreviewForm: FC<Props> = ({
  setFormSection,
  formData,
  setFormData,
  createAccountPoll,
}) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { setCurrentBounty } = useBounty();

  const [creationType, setCreationType] = useState<"new" | "existing">("new");
  const [mint, setMint] = useState<Prisma.Mint>();
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const { mutateAsync } = api.bounties.createBounty.useMutation();

  const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "Public",
    },
    option2: {
      title: "Private",
    },
    selected: "option1",
  });

  const createBounty = async () => {
    setIsSubmittingIssue(true);
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

    const mintKey = new PublicKey(mint.publicKey);

    const { timestamp, signature, escrowKey } = await createFFA(
      currentWallet,
      program,
      provider,
      mintKey
    );
    createAccountPoll(escrowKey);
    const bounty: Bounty = await mutateAsync({
      email: currentUser.email,
      industryId: formData.industryId,
      disciplineId: formData.displineId,
      price: parseFloat(formData.issuePrice),
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

    setFormSection("SUCCESS");
    setCurrentBounty(bounty);
  };

  useEffect(() => {
    if (toggleConfig.selected === "option2") {
      setFormData({
        ...formData,
        isPrivate: true,
      });
    } else {
      setFormData({
        ...formData,
        isPrivate: false,
      });
    }
  }, [toggleConfig.selected]);

  return (
    <div>
      <h1>Preview</h1>
      <div className="w-full flex flex-col gap-4 mt-6">
        <div className="flex items-center gap-8">
          <Toggle
            toggleConfig={toggleConfig}
            setToggleConfig={setToggleConfig}
          />
          <div className="flex flex-col gap-2 max-w-[350px]">
            <p>
              When <span className="font-bold">public</span> your quest will be
              discoverable.
            </p>
            <p>
              When <span className="font-bold">private</span> your quest can
              only be shared using your unique link.
            </p>
          </div>
          {/* TODO: unfunded quest CTA */}
        </div>

        <div className="w-full flex items-center justify-between">
          {/* three cards in view */}
          {/* 1. preview card (addarg working on this) */}
          <PreviewCardBase title="Quest">Preview Card</PreviewCardBase>
          {/* 2. quest links card */}
          <PreviewCardBase title="Links">Preview Card</PreviewCardBase>
          {/* 3. quest photos card */}
          <PreviewCardBase title="Photos">Preview Card</PreviewCardBase>
        </div>

        <div className="w-full px-10 mt-4 flex items-center justify-between">
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
            // onClick={() => createBounty()}
            className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            SUBMIT
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PreviewForm;
