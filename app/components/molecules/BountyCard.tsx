import { FC, SVGAttributes } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fastEnterAnimation, midClickAnimation } from "@/src/constants";
import { useRouter } from "next/router";
import { BountyPreview, FormData } from "@/types/";
import {
  BountyCardFrame,
  ContributorInfo,
  PriceTag,
  StarIcon,
} from "@/components";
import { useUserWallet } from "@/providers";
import { getFormattedDate } from "@/utils";

export interface BountyCardProps extends SVGAttributes<SVGSVGElement> {
  bounty?: BountyPreview;
  formData?: FormData;
}

const BountyCard: FC<BountyCardProps> = ({ bounty, formData }) => {
  const { currentUser } = useUserWallet();

  const router = useRouter();

  const bountyCardAnimation = bounty
    ? { ...fastEnterAnimation, ...midClickAnimation }
    : null;

  const displayedTags = bounty
    ? bounty.tags.slice(0, 4)
    : formData.tags.slice(0, 4);

  const tagOverflow = bounty
    ? bounty.tags.length > 4
    : formData.tags.length > 4;

  // useEffect(() => {
  //   console.log("bounty: ", bounty);
  //   console.log("formData: ", formData);
  // }, [bounty, formData]);

  // TODO: based on industry of bounty, change the color of the card

  return (
    <motion.div
      className={`relative w-[291px] h-[292px] ${
        bounty ? "cursor-pointer" : ""
      }`}
      {...bountyCardAnimation}
      onClick={() => router.push(`/bounties/${bounty?.id}`)}
    >
      <div className="absolute left-1/2 -translate-x-[53%] top-[6px] w-7">
        <Image src="/assets/icons/eng.png" width={28} height={28} alt="eng" />
      </div>
      <BountyCardFrame color="#C8F4C4" />
      <div className="w-full absolute top-1">
        <div className="w-full flex items-center justify-between px-1">
          <PriceTag
            price={bounty ? bounty?.escrow.amount : Number(formData.issuePrice)}
          />
          <p className="text-xs font-bold mr-2">{getFormattedDate(bounty)}</p>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full flex flex-col p-4">
        <div className="w-full flex items-center justify-between mt-8">
          {/* creator profile */}
          {bounty?.creator && <ContributorInfo user={bounty?.creator?.user} />}

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
          <div className="flex items-center gap-[1px]">
            <StarIcon fill="#29CE17" />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>
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
          {bounty &&
            displayedTags.map((tag) => (
              <div
                className="border border-neutralBtnBorder rounded-full 
                px-3 py-1 flex items-center justify-center"
                key={tag.name}
              >
                {tag.name}
              </div>
            ))}
          {formData &&
            displayedTags.map((tag) => (
              <div
                className="border border-neutralBtnBorder rounded-full 
                px-3 py-1 flex items-center justify-center"
                key={tag.name}
              >
                {tag.name}
              </div>
            ))}
          {tagOverflow && <p className="text-xs">+ more</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default BountyCard;
