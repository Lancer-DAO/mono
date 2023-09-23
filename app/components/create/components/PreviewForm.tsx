import { Dispatch, FC, SetStateAction, useState } from "react";
import { BountyCard, PreviewCardBase, USDC } from "@/components";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/atoms/Modal";
import { createFFA } from "@/escrow/adapters";
import {
  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE,
  IS_MAINNET,
  smallClickAnimation,
} from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { useReferral } from "@/src/providers/referralProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { Bounty, IAsyncResult } from "@/types";
import { FORM_SECTION, QuestFormData } from "@/types/forms";
import { api } from "@/utils";
import { Mint } from "@prisma/client";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: QuestFormData;
  createAccountPoll: (publicKey: PublicKey) => void;
  handleChange: (event) => void;
  mint: Mint;
}

export const PreviewForm: FC<Props> = ({
  setFormSection,
  formData,
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
        price:
          formData.issuePrice === ""
            ? undefined
            : parseFloat(formData.issuePrice),
        title: formData.issueTitle,
        description: formData.issueDescription,
        tags: formData.tags,
        links: formData.links,
        media: formData.media,
        estimatedTime: parseFloat(formData.estimatedTime),
        isPrivate: formData.isPrivate,
        isTest: formData.isTest,
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
    } catch (error) {
      setCreateQuestState({ error });
      if (error.message === "Wallet is registered to another user") {
        toast.error(
          "Wallet is registered to another user. Use another wallet to create this Quest."
        );
      }
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
            <BountyCard formData={formData} linked={false} />
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
          <PreviewCardBase title="References">
            <div
              className={`${
                formData?.media.length > 1 ? "grid grid-cols-2 gap-4" : "flex"
              }`}
            >
              {formData?.media.length > 0 && formData?.media[0] ? (
                formData?.media.map((med, index) => {
                  return (
                    <Dialog key={index}>
                      <div className="relative border-2 border-primaryBtnBorder rounded-xl p-1">
                        <div className="flex flex-col items-start">
                          <DialogTrigger className="w-full">
                            <div className="flex flex-col overflow-hidden">
                              <Image
                                src={med.imageUrl}
                                alt={med.title}
                                width={250}
                                height={250}
                                className="mb-2 rounded-md"
                              />
                              <p className="w-full font-bold text-lg mx-1 truncate text-left">
                                {med.title}
                              </p>
                              <p className="w-full text-sm truncate mx-1 text-left">
                                {med.description}
                              </p>
                            </div>
                          </DialogTrigger>
                        </div>
                      </div>
                      <DialogContent className="max-w-fit flex flex-col items-center">
                        <DialogHeader className="flex text-3xl justify-start">
                          <DialogTitle className="text-3xl">
                            {med.title}
                          </DialogTitle>
                          <DialogDescription>
                            {med.description}
                          </DialogDescription>
                        </DialogHeader>
                        <Image
                          src={med.imageUrl}
                          alt={med.title}
                          width={1000}
                          height={1000}
                          className="rounded-md mt-4"
                        />
                      </DialogContent>
                    </Dialog>
                  );
                })
              ) : (
                <p
                  className="bg-white p-3 border border-neutralBtnBorder
                  rounded-lg text-textGreen text-base"
                >
                  No references provided!
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
