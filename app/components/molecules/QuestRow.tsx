import {
  BountyCardFrame,
  ContributorInfo,
  PriceTag,
  // StarIcon,
  LockIcon,
  Logo,
} from "@/components";
import { useUserWallet } from "@/providers";
import { fastEnterAnimation, midClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { BountyPreview, QuestFormData, Industry } from "@/types/";
import { api, getFormattedDate } from "@/utils";
import { motion } from "framer-motion";
import { marked } from "marked";
import Image from "next/image";
import { FC, SVGAttributes, useCallback, useEffect, useState } from "react";

export interface BountyCardProps extends SVGAttributes<SVGSVGElement> {
  bounty?: BountyPreview;
  formData?: QuestFormData;
  linked?: boolean;
}

const QuestRow: FC<BountyCardProps> = ({
  bounty,
  formData,
  linked = true,
}) => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();
  const { allIndustries } = useIndustry();

  const [selectedIndustry, setSelectedIndustry] = useState<Industry>();

  const bountyCardAnimation = linked
    ? { ...fastEnterAnimation, ...midClickAnimation }
    : null;

  const displayedTags = bounty
    ? bounty.tags.slice(0, 4).map((tag) => tag.name)
    : formData.tags.slice(0, 4).map((tag) => tag);

  const tagOverflow = bounty
    ? bounty.tags.filter((tag) => tag.name !== "").length > 4
    : formData.tags.filter((tag) => tag !== "").length > 4;

  const handleBountyLink = () => {
    if (!linked) return null;
    if (formData) {
      return `/quests/${currentBounty?.id?.toString()}`;
    } else {
      return `/quests/${bounty?.id}`;
    }
  };

  const handlePrice = useCallback(() => {
    if (bounty) {
      return Number(bounty?.escrow?.amount);
    } else {
      return Number(formData.issuePrice);
    }
  }, [bounty, formData]);

  const previewMarkup = () => {
    const markdown = marked.parse(
      bounty ? bounty.description : formData.issueDescription,
      { breaks: true }
    );
    return { __html: markdown };
  };

  useEffect(() => {
    if (formData) {
      const industry = allIndustries?.find(
        (industry) => industry?.id === formData?.industryId
      );
      setSelectedIndustry(industry);
    }
  }, [formData?.industryId]);

  if (!bounty && !formData) return null;

  return (

    <div className="rounded-5 flex px-[10px] py-[5px] flex-col justify-start h-[90px] w-half border-[#EDF2F1] border-[1px] border-solid">


      <div className="w-full h-[70%] flex justify-between">

        <div className="flex h-full items-center justify-center gap-[5px]">
          {bounty?.creator?.user?.picture ? (
            <Image
              src={bounty?.creator?.user.picture ? bounty?.creator?.user.picture : ``}
              width={24}
              height={24}
              alt={bounty?.creator?.user.name}
              className="h-[24px] w-[24px] rounded-full"
            />
          ) : (
            <Logo width="24px" height="24px" />
          )}

          <div className="flex flex-col">
            <p className="text-[14px] text-[#2E3332] font-bold">{bounty?.creator?.user.name}</p>
            <p className="text-[12px]">{bounty.title}</p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-5">

          <div className="flex flex-col align-center justify-center">
            <p>{bounty && Number(bounty?.escrow.amount) ? Number(bounty?.escrow.amount) : "N/A"}</p>
            <p>Created on {getFormattedDate(bounty)}</p>
          </div>
          <button className="px-[5px] text-[#2E3332] text-[14px] text-bold border-[1px] border-solid border-[#EDF2F1]">Details</button>
        </div>


      </div>


      <div className="flex flex-wrap gap-[5px] w-full h-[30%]">
        {bounty.tags.map((tag) => (
          <div
            className="text-[#2E3332] text-[12px] rounded-2 bg-[#F7FAF9] border-[1px] border-solid border-[#EDF2F1] "
            key={tag.name}>{tag.name}</div>
        ))}
      </div>
    </div>



  );

};

export default QuestRow;
