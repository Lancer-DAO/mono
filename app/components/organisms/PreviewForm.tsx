import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE,
  IS_MAINNET,
  smallClickAnimation,
} from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { FORM_SECTION, FormData } from "@/types/forms";
import { api } from "@/utils";
import { PublicKey } from "@solana/web3.js";
import { ToggleConfig } from "../molecules/Toggle";
import { PreviewCardBase, Toggle, BountyCard } from "@/components";
import { Bounty, Industry } from "@/types";
import { Mint } from "@prisma/client";
import { createFFA } from "@/escrow/adapters/createFeatureFundingAccount";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  industries: Industry[];
  setFormData: Dispatch<SetStateAction<FormData>>;
  createAccountPoll: (publicKey: PublicKey) => void;
  mint: Mint;
}

const PreviewForm: FC<Props> = ({
  setFormSection,
  formData,
  industries,
  setFormData,
  createAccountPoll,
  mint,
}) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bounties.createBounty.useMutation();

  const [creationType, setCreationType] = useState<"new" | "existing">("new");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

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

    const mintKey = new PublicKey(mint?.publicKey);

    const { timestamp, signature, escrowKey } = await createFFA(
      currentWallet,
      program,
      provider,
      mintKey
    );
    createAccountPoll(escrowKey);
    const bounty: Bounty = await mutateAsync({
      email: currentUser.email,
      industryIds: [formData.industryId],
      disciplineIds: formData.displineIds,
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

    setFormSection("FUND");
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
      <div className="w-full flex flex-col gap-4 my-6">
        <p className="max-w-[500px]">
          This is your chance to review your Quest in its entirety. By clicking
          "Continue", you are intializing this Quest and will move on to funding
          it. Any changes you'd like to make can be done by clicking the "Back"
          buttons. You're one step away from putting your Quest out into the
          world!
        </p>

        <div className="w-full flex items-center justify-between">
          {/* three cards in view */}
          {/* 1. preview card */}
          <PreviewCardBase title="Quest">
            <BountyCard formData={formData} allIndustries={industries} />
          </PreviewCardBase>
          {/* 2. quest links card */}
          <PreviewCardBase title="Links">Preview Card</PreviewCardBase>
          {/* 3. quest photos card */}
          <PreviewCardBase title="References">Preview Card</PreviewCardBase>
        </div>

        <div className="flex flex-col gap-8 w-fit py-3">
          <Toggle
            toggleConfig={toggleConfig}
            setToggleConfig={setToggleConfig}
          />
          <div className="flex flex-col gap-2 max-w-[350px] pb-3">
            <p>
              When <span className="font-bold">public</span> your quest will be
              discoverable on our marketplace.
            </p>
            <p>
              When <span className="font-bold">private</span> your quest can
              only be shared using your unique link.
            </p>
          </div>
        </div>

        <div className="w-full flex items-center justify-between">
          {/* three cards in view */}
          {/* 1. preview card (addarg working on this) */}
          <PreviewCardBase title="Quest">Preview Card</PreviewCardBase>
          {/* 2. quest links card */}
          <PreviewCardBase title="Links">
            <div className="w-full flex flex-col justify-start gap-2 px-6">
              {formData.links.map((link: string, index: number) => (
                <Link
                  href={link}
                  key={index}
                  className="w-full h-12 px-3 border border-neutralBtnBorder bg-neutralBtn text-green-700 text-xl py-2 rounded-md overflow-hidden ellipsis whitespace-nowrap text-ellipsis"
                >
                  {link}
                </Link>
              ))}
              <div className="w-full h-24 px-3 border border-neutralBtnBorder bg-neutralBtn py-2 text-lg rounded-md overflow-hidden ellipsis text-green-700">
                {formData.comment}
              </div>
            </div>
          </PreviewCardBase>
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
            onClick={() => createBounty()}
            className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
            w-[150px] h-[50px] rounded-lg text-base"
          >
            CONTINUE
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PreviewForm;
