import { FC, SVGAttributes } from "react";
import Image from "next/image";
import { BOUNTY_USER_RELATIONSHIP, BountyPreview, FormData } from "@/types/";
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

  const creator = bounty?.users.find((user) =>
    user.relations.includes(BOUNTY_USER_RELATIONSHIP.Creator)
  );

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
    <div className="relative w-[291px] h-[292px]">
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
          {creator && <ContributorInfo user={creator.user} />}

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

        <div className="mt-8">
          <p className="text-2xl font-bold">
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
                key={tag}
              >
                {tag}
              </div>
            ))}
          {tagOverflow && <p className="text-xs">+ more</p>}
        </div>
      </div>
    </div>
  );
};

export default BountyCard;
