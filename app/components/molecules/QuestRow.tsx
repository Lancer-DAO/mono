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

    <div
      style={{ borderBottom: "1px solid #EDF2F1", opacity: bounty.state == "complete" ? "80%" : "100%" }}
      className="items-center bg-white gap-[10px] rounded-5 flex py-[20px] px-[10px] flex-col justify-start h-[120px] rounded-[5px] hover:bg-[#F7FAF9]">


      <div className="w-full flex justify-between">

        <div className="flex h-full items-center justify-center gap-[10px]">
          {bounty?.creator?.user?.picture ? (
            <Image
              src={bounty?.creator?.user.picture ? bounty?.creator?.user.picture : ``}
              width={28}
              height={28}
              alt={bounty?.creator?.user.name}
              className="h-[28px] w-[28px] rounded-full"
            />
          ) : (
            <Logo width="28px" height="28px" />
          )}

          <div className="flex flex-col">
            <p className="text-[18px] text-[#2E3332] font-bold">{bounty?.creator?.user.name}</p>
            <p className="text-[16px]">{bounty.title}</p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-5">

          <div className="flex flex-col items-end justify-center">
            <div className="flex items-center justify-center gap-[10px]">
              {bounty && Number(bounty?.escrow.amount) ? <LockIcon width="20px" height="20px" opacity="70%"/> : null}
              <p className="text-[18px] text-[#2E3332]">${bounty && Number(bounty?.escrow.amount) ? Number(bounty?.escrow.amount).toLocaleString() : "N/A"}</p>
            </div>

            <p className="text-[16px] text-[#73807C]">Created on {getFormattedDate(bounty)}</p>
          </div>
          <a target="_blank" rel="noreferrer" href={handleBountyLink()} className="rounded-[6px] py-[8px] px-[16px] font-[800] text-[#2E3332] text-[18px] border-[1px] border-solid border-[#EDF2F1]">Details</a>
        </div>


      </div>


      <div className="flex flex-wrap gap-[10px] w-full">
        {bounty.tags.map((tag) => (
          <div
            className="px-[5px] bg-[#F7FAF9] text-[#2E3332] text-[14px] rounded-[8px] border-[1px] border-solid border-[#EDF2F1]"
            key={tag.name}>{tag.name}</div>
        ))}
      </div>
    </div>



  );

};

export default QuestRow;
