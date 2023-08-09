import { FC, useEffect, useState, Dispatch, SetStateAction } from "react";
import { useUserWallet } from "@/src/providers/userWalletProvider";
import { IS_MAINNET, smallClickAnimation } from "@/src/constants";
import * as Prisma from "@prisma/client";
import { FORM_SECTION, FormData } from "@/types/forms";
import { useBounty } from "@/src/providers/bountyProvider";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { motion } from "framer-motion";
import { PreviewCardBase, Toggle } from "@/components";
import { ToggleConfig } from "../molecules/Toggle";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
}

const SuccessForm: FC<Props> = ({ setFormSection, formData, setFormData }) => {
  const { currentUser, currentWallet, program, provider } = useUserWallet();
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();

  const [creationType, setCreationType] = useState<"new" | "existing">("new");
  const [mint, setMint] = useState<Prisma.Mint>();
  const [isOpenMints, setIsOpenMints] = useState(false);
  const [isOpenIssue, setIsOpenIssue] = useState(false);
  const [mints, setMints] = useState<Prisma.Mint[]>([]);

  const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "Public",
    },
    option2: {
      title: "Private",
    },
    selected: "option1",
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, ""],
    });
  };

  const removeLink = (targetIndex: number) => {
    const updatedLinks: string[] = [...formData.links];
    console.log("updatedLinks, index", updatedLinks, targetIndex);
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

  const handleDescriptionChange = (event) => {
    setFormData({
      ...formData,
      issueDescription: event.target.value,
    });
  };

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  return (
    <div>
      <h1>Success! Your Quest is live.</h1>
      <div className="w-full flex items-center justify-between">
        <PreviewCardBase title="Quest">Preview Card</PreviewCardBase>
      </div>
    </div>
  );
};

export default SuccessForm;
