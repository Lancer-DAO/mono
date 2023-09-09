import { useBounty } from "@/src/providers/bountyProvider";
import { cn } from "@/src/utils";
import { BountyState } from "@/types";
import { clsx } from "clsx";
import dayjs from "dayjs";
import { marked } from "marked";
import { ArrowLeft, ChevronUp } from "react-feather";
import { Bounty } from "../Bounty";

const QuestDetails = () => {
  const { currentBounty } = useBounty();

  const formatString = (str: string) => {
    return str
      .replaceAll("_", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const previewMarkup = () => {
    const markdown = marked.parse(currentBounty.description, { breaks: true });
    return { __html: markdown };
  };


  return (
    <div className="flex flex-col bg-white w-[610px] border border-grey200 rounded-lg">
      {/* quest header */}
      <div className="flex flex-col items-start px-4 py-6">
        <div className="flex items-center pb-1 gap-2">
          <ArrowLeft className="w-4 h-4 text-grey400" />
          <h1 className="text-grey600 font-bold">{currentBounty?.title}</h1>
        </div>
        <div className="flex items-center pb-[10px] px-6">
          <p className="text-grey500">{`Created on ${dayjs.unix(parseInt(currentBounty.createdAt) / 1000).format("D MMM YYYY")}`}</p>
          <div className="h-[20px] w-[1px] mx-4 bg-slate-200" />
          <p className="text-grey500">{`${currentBounty.estimatedTime.toString()} hour`}</p>
          <div className="h-[20px] w-[1px] mx-4 bg-slate-200" />
          <div>
            <p className="text-grey500">{currentBounty.price?.toString()}</p>
          </div>
        </div>
        <div className="flex px-5 gap-2">
          {currentBounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentBounty.tags
                .filter((tag) => tag.name !== "")
                .map((tag) => (
                  <div
                    className="text-grey600 text-center text bg-grey100 w-fit px-2 py-1 rounded-xl border border-grey200"
                    key={tag.name}
                  >
                    {tag.name}
                  </div>
              ))}
            </div>
          )}
          <div
            className={cn(
              "text-center text w-fit px-2 py-1 rounded-xl border",
              {
                "text-grey600 border-[#C0D998] bg-[#CBE4A1]": (BountyState.NEW, BountyState.ACCEPTING_APPLICATIONS).includes(currentBounty.state as BountyState),
                "text-grey600 border-[#E2C2F2] bg-[#EDC9FF]": currentBounty.state === BountyState.IN_PROGRESS,
                "border-[#333] bg-[#3D3D3D] text-white": currentBounty.state === BountyState.COMPLETE,
                "text-grey600 border-[#F2B0AA] bg-[#FFBCB5]": [BountyState.CANCELED, BountyState.AWAITING_REVIEW].includes(currentBounty.state as BountyState),
              }
            )}
            >
            {formatString(currentBounty.state)}
          </div>
        </div>
      </div>
      <div className="h-[1px] w-full bg-grey200" />
      {/* quest content */}
      <div className="px-10 py-4">
        <div className="flex justify-between pb-[10px]">
          <p className="font-bold text-grey600">Job Description</p>
          <ChevronUp className="w-3 " />
        </div>
        <p dangerouslySetInnerHTML={previewMarkup()} />
      </div>
    </div>
  )
}

export default QuestDetails;