import { LockIcon } from "@/components/@icons";
import { BountyCardFrame, ContributorInfo, PriceTag } from "@/components/atoms";
import { useUserWallet } from "@/providers";
import { fastEnterAnimation, midClickAnimation } from "@/src/constants";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyPreview, FormData, Industry } from "@/types/";
import { getFormattedDate } from "@/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { FC, SVGAttributes, useEffect, useState } from "react";

export interface BountyCardProps extends SVGAttributes<SVGSVGElement> {
  bounty?: BountyPreview;
  formData?: FormData;
  allIndustries: Industry[];
  linked?: boolean;
}

export const BountyCard: FC<BountyCardProps> = ({
  bounty,
  formData,
  allIndustries,
  linked = true,
}) => {
  const { currentUser } = useUserWallet();
  const { currentBounty } = useBounty();
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>();

  const bountyCardAnimation = linked
    ? { ...fastEnterAnimation, ...midClickAnimation }
    : null;

  const displayedTags = bounty
    ? bounty.tags.map((tag) => tag.name)
    : formData.tags.slice(0, 4).map((tag) => tag);

  const tagOverflow = bounty
    ? bounty.tags.length > 3
    : formData.tags.length > 3;

  const handleBountyLink = () => {
    if (!linked) return null;
    if (formData) {
      return `/quests/${currentBounty?.id?.toString()}`;
    } else {
      return `/quests/${bounty?.id}`;
    }
  };

  useEffect(() => {
    if (formData) {
      const industry = allIndustries?.find(
        (industry) => industry?.id === formData?.industryId
      );
      setSelectedIndustry(industry);
    }
  }, [formData?.industryId]);

  // useEffect(() => {
  //   console.log("bounty: ", bounty);
  //   console.log("formData: ", formData);
  // }, [bounty, formData]);

  if (!bounty && !formData) return null;

  const handlePriceIcon = () => {
    if (bounty) {
      return bounty?.escrow?.mint?.logo;
    } else {
      return formData.issuePriceIcon;
    }
  };

  return (
    <motion.a
      className={`relative w-[291px] h-[292px] ${
        linked ? "cursor-pointer" : ""
      }`}
      {...bountyCardAnimation}
      href={handleBountyLink()}
    >
      <div className="absolute left-1/2 -translate-x-[53%] top-[6px] w-7">
        <Image
          src={
            bounty
              ? bounty?.industries[0]?.icon
              : selectedIndustry?.icon ?? allIndustries?.[0]?.icon
          }
          width={28}
          height={28}
          alt={
            bounty
              ? bounty?.industries[0]?.name
              : selectedIndustry?.name ?? "industry icon"
          }
        />
      </div>
      <BountyCardFrame
        color={bounty ? bounty?.industries[0]?.color : selectedIndustry?.color}
      />
      <div className="w-full absolute top-1">
        <div className="w-full flex items-center justify-between px-1">
          <PriceTag
            price={bounty ? bounty?.escrow.amount : Number(formData.issuePrice)}
            icon={handlePriceIcon()}
          />
          <p className="text-xs font-bold mr-2">
            <span className="text-textPrimary text-[11px] font-base">
              created
            </span>{" "}
            {getFormattedDate(bounty)}
          </p>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full flex flex-col p-4">
        <div className="w-full flex items-center justify-between mt-8">
          {/* creator profile */}
          {bounty && bounty?.creator && (
            <ContributorInfo user={bounty?.creator?.user} />
          )}

          {formData && currentUser && (
            <div className="flex items-center gap-3">
              <Image
                src={currentUser?.picture}
                width={25}
                height={25}
                alt="user picture"
                className="rounded-full overflow-hidden"
              />
              <p className="text-xs font-bold">{currentUser?.name}</p>
            </div>
          )}
          {/* testing */}
          {/* <div className="flex items-center gap-[1px]">
            <StarIcon fill="#29CE17" />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div> */}
        </div>

        <div className="mt-2">
          <p className="text-2xl font-bold multi-line-ellipsis">
            {bounty ? bounty.title : formData.issueTitle}
          </p>
          <div className="w-full max-h-[60px] multi-line-ellipsis overflow-hidden">
            <p>{bounty ? bounty.description : formData.issueDescription}</p>
          </div>
        </div>
        <div className="relative w-full pr-10 flex flex-wrap items-center gap-1 mt-auto">
          {displayedTags.length > 0 &&
            displayedTags[0] !== "" &&
            displayedTags.map((tag) => (
              <div
                className="border border-neutralBtnBorder rounded-full 
                px-3 py-1 flex items-center justify-center"
                key={tag}
              >
                {tag}
              </div>
            ))}
          {tagOverflow && <p className="text-xs">+ more</p>}
        </div>
      </div>
      {(formData?.isPrivate || bounty?.isPrivate) && (
        <div className="absolute bottom-4 right-4 z-50">
          <LockIcon fill="#464646" width={15} height={15} />
        </div>
      )}
    </motion.a>
  );
};
