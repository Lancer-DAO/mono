import { useState, Dispatch, FC, SetStateAction, useEffect } from "react";
import { IndustryDropdown, Logo, Toggle } from "@/components";
import { IS_MAINNET, smallClickAnimation, USDC_MINT } from "@/src/constants";
import { FORM_SECTION, QuestFormData } from "@/types/forms";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Bounty, IAsyncResult, Industry } from "@/types";
import { api } from "@/src/utils";
import { useIndustry } from "@/src/providers/industryProvider";
import { useUserWallet } from "@/src/providers";
import Tags from "./AdditionalInfo/tags";
import Image from "next/image";
import ReferenceDialogue from "@/components/molecules/ReferenceDialogue";
import { Trash, X } from "lucide-react";
import IndustryOptions from "@/components/molecules/IndustryOptions";
import SelectOptions from "@/components/molecules/SelectOptions";
import { Option } from "@/components/molecules/SelectOptions";
import { PublicKey } from "@solana/web3.js";
import { createFFA } from "@/escrow/adapters";
import { useReferral } from "@/src/providers/referralProvider";
import { useBounty } from "@/src/providers/bountyProvider";
import { useRouter } from "next/router";

interface Props {
  formData: QuestFormData;
  setFormData: Dispatch<SetStateAction<QuestFormData>>;
  handleChange: (event) => void;
}

const VISIBILITY_OPTIONS: Option[] = [
  {
    name: "Public",
    value: "Public",
  },
  {
    name: "Private",
    value: "Private",
  },
];

const TEST_OPTIONS: Option[] = [
  {
    name: "Real",
    value: "Real",
  },
  {
    name: "Test",
    value: "Test",
  },
];

export const CreateBountyForm: FC<Props> = ({
  formData,
  setFormData,
  handleChange,
}) => {
  const { mutateAsync } = api.bounties.createBounty.useMutation();
  const { setCurrentBounty } = useBounty();
  const router = useRouter();

  const { allIndustries } = useIndustry();
  const { mutateAsync: deleteMedia } = api.bounties.deleteMedia.useMutation();
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const maxReferences = 4;
  const [visibilityOption, setVisibilityOption] = useState<Option>(
    VISIBILITY_OPTIONS[0]
  );
  const [testOption, setTestOption] = useState<Option>(TEST_OPTIONS[0]);
  const [createQuestState, setCreateQuestState] = useState<
    IAsyncResult<string>
  >({ isLoading: false });
  const { getRemainingAccounts, getSubmitterReferrer } = useReferral();

  const createBounty = async () => {
    if (!currentWallet?.publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    setCreateQuestState({ isLoading: true, loadingPrompt: "Creating Quest" });
    try {
      const mintKey = new PublicKey(USDC_MINT);

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
      const bounty: Bounty = await mutateAsync({
        email: currentUser.email,
        industryIds: [formData.industryId],
        title: formData.issueTitle,
        description: formData.issueDescription,
        tags: formData.tags,
        links: formData.links,
        media: formData.media,
        isPrivate: formData.isPrivate,
        isTest: formData.isTest,
        publicKey: currentWallet.publicKey.toString(),
        escrowKey: escrowKey.toString(),
        transactionSignature: signature,
        timestamp: timestamp,
        mint: 1,
      });
      setCreateQuestState({ isLoading: false, result: "Quest Created" });
      setCurrentBounty(bounty);
      router.push(`/quests/${bounty.id}`);
    } catch (error) {
      console.log("Quest Error: ", error);
      setCreateQuestState({ error });
      if (error.message === "Wallet is registered to another user") {
        toast.error(
          "Wallet is registered to another user. Use another wallet to create this Quest."
        );
      }
    }
  };

  const addLink = () => {
    if (formData.links.length < 4) {
      setFormData({
        ...formData,
        links: [...formData.links, ""],
      });
    }
  };

  const removeLink = (targetIndex: number) => {
    const updatedLinks: string[] = [...formData.links];
    setFormData({
      ...formData,
      links: updatedLinks?.filter((_, index) => index !== targetIndex),
    });
  };

  const updateLink = (index, value) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index] = value;
    setFormData({
      ...formData,
      links: updatedLinks,
    });
  };

  const handleReferenceAdded = (newReference) => {
    setFormData({
      ...formData,
      media: [...formData.media, newReference],
    });
  };

  const handleReferenceRemoved = async (removeIndex) => {
    await deleteMedia({ imageUrl: formData.media.at(removeIndex).imageUrl });
    const updatedMedia = formData.media.filter(
      (_, index) => index !== removeIndex
    );
    setFormData({
      ...formData,
      media: updatedMedia,
    });
  };

  useEffect(() => {
    if (visibilityOption.value === "Private") {
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
  }, [visibilityOption]);

  useEffect(() => {
    if (testOption.name === "Test") {
      setFormData({
        ...formData,
        isTest: true,
      });
    } else {
      setFormData({
        ...formData,
        isTest: false,
      });
    }
  }, [testOption]);

  return (
    <div className="px-10 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center rounded-full bg-neutral-200 h-[32px] w-[32px]">
        <Logo width="27px" height="27px" />
      </div>
      <h1 className="font-bold text-neutral-600">Let’s create a Quest</h1>
      <div className="flex flex-col bg-white rounded-md py-8 px-12 w-[500px] mt-6">
        <IndustryOptions
          options={allIndustries}
          selected={allIndustries?.find((industry) =>
            formData.industryId === industry.id ? industry : null
          )}
          onChange={(selected: Industry) => {
            setFormData({
              ...formData,
              industryId: selected.id,
            });
          }}
        />
        <div className="w-full h-[1px] bg-neutral-200 my-7" />
        <div className="relative flex items-center mb-7">
          <div className="mr-4 text-sm">Title</div>
          <input
            type="text"
            className="placeholder:text-neutral-500 border bg-neutral-100 
            border-neutral-200 w-full py-2 px-4 rounded-lg text-sm"
            name="issueTitle"
            placeholder="Marketing Website"
            id="issue-title-input"
            value={formData.issueTitle}
            onChange={handleChange}
          />
        </div>
        <div className="w-full text-sm mb-4">Project Description</div>
        <textarea
          className="placeholder:text-neutral-500 border bg-neutral-100 text-sm min-h-[75px] 
            border-neutral-200 w-full rounded-lg px-3 py-2 resize-y"
          name="issueDescription"
          placeholder="Landing page for a HR Software focusing on SME’s. We have something outdated and we need a new website that shows new shiny features and reflect our Brand."
          id="issue-description-input"
          value={formData.issueDescription}
          onChange={handleChange}
        />
        <div className="relative flex  my-7">
          <div className="mr-4 text-sm mt-2">Tags</div>
          <Tags formData={formData} setFormData={setFormData} />
        </div>
        <div className="relative flex  mb-4">
          <div className="mr-4 text-sm">Visibility</div>
          <SelectOptions
            options={VISIBILITY_OPTIONS}
            selected={visibilityOption}
            onChange={setVisibilityOption}
          />
        </div>
        {currentUser?.isLancerDev && (
          <div className="relative flex  mb-4">
            <div className="mr-4 text-sm">Test Options</div>
            <SelectOptions
              options={TEST_OPTIONS}
              selected={testOption}
              onChange={setTestOption}
            />
          </div>
        )}
        <div className="w-full text-sm mb-4">Additional Links</div>
        <div>
          <div className="relative w-full flex flex-col gap-2">
            {formData.links.map((link: string, index: number) => (
              <div className="flex items-center gap-1" key={index}>
                <input
                  type="text"
                  className="text-sm placeholder:text-neutral-500 border bg-neutral-100 
                  border-neutral-200 w-full rounded-lg px-4 py-2"
                  name={`link-${index}`}
                  placeholder="Paste Link"
                  id={`link-input-${index}`}
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                />
                <motion.button
                  onClick={() => removeLink(index)}
                  {...smallClickAnimation}
                  key={index}
                  className={`${
                    index === 0 && "invisible"
                  } bg-neutral-100 border border-neutral-200 
                    text-neutral-500 w-12 px-4 py-1.5 rounded-lg flex items-center justify-center`}
                >
                  <Trash />
                </motion.button>
              </div>
            ))}
          </div>
          {formData.links.length < 4 && (
            <motion.button
              onClick={() => addLink()}
              {...smallClickAnimation}
              className="bg-neutral-100 border border-neutral-200 text-neutral-500 text-sm h-8 w-14 rounded-lg mt-2"
            >
              +
            </motion.button>
          )}
          <div className="w-full text-sm my-4">Attach Files</div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(maxReferences)].map((_, index) => {
              if (index < formData.media.length) {
                const media = formData.media[index];
                return (
                  <div
                    className="flex items-center justify-center relative border border-neutral-200 rounded-xl p-1"
                    key={index}
                  >
                    <Image
                      src={media.imageUrl}
                      alt={media.title}
                      width={64}
                      height={64}
                      className="mb-2 rounded-md"
                    />

                    <motion.button
                      className="absolute top-[-10px] right-[-10px] p-1 bg-neutral-100 border border-neutral-200 rounded-full"
                      {...smallClickAnimation}
                      onClick={() => handleReferenceRemoved(index)}
                    >
                      <X size={18} strokeWidth={1.25} />
                    </motion.button>
                  </div>
                );
              } else {
                return (
                  <ReferenceDialogue
                    key={index}
                    onReferenceAdded={handleReferenceAdded}
                  />
                );
              }
            })}
          </div>
        </div>
      </div>
      <motion.button
        {...smallClickAnimation}
        onClick={() => createBounty()}
        className={` h-[50px] mt-4 w-[500px] rounded-lg text-base ${
          createQuestState.error
            ? " bg-error  text-white"
            : " bg-primary200  text-white"
        } `}
      >
        {createQuestState.error
          ? "Failed to Create Quest"
          : createQuestState.isLoading
          ? createQuestState.loadingPrompt
          : createQuestState.result
          ? createQuestState.result
          : "Create Quest"}
      </motion.button>
    </div>
  );
};
