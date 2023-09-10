import { useState } from "react";
import Link from "next/link";
import FundCTA from "@/components/atoms/FundCTA";
import { useBounty } from "@/src/providers/bountyProvider";
import { cn, formatPrice, getSolscanAddress } from "@/src/utils";
import { BountyState } from "@/types";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import { marked } from "marked";
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from "react-feather";

const Divider = () => <div className="h-[20px] w-[1px] mx-4 bg-slate-200" />;

const QuestDetails = () => {
  const [dropdownOpen, setDropdownOpen] = useState(true);
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
        {/* back arrow */}
        <div className="flex items-center pb-1 gap-2">
          <Link href="/quests">
            <ArrowLeft className="text-grey400" width={16} height={16} />
          </Link>
          <h2 className="text-grey600 font-bold">{currentBounty?.title}</h2>
        </div>
        {/* quest info */}
        <div className="flex items-center pb-[10px] px-6">
          <p className="text text-grey500">{`Created on ${dayjs
            .unix(parseInt(currentBounty.createdAt) / 1000)
            .format("D MMM YYYY")}`}</p>
          {/* TODO: either add back estimated time or remove from design */}
          {/* <Divider />
          <p className="text text-grey500">{`${currentBounty.estimatedTime.toString()} ${
            Number(currentBounty.estimatedTime) > 1 ? "hours" : "hour"
          }`}</p> */}
          <Divider />
          {currentBounty?.escrow?.amount ? (
            <div className="flex items-center gap-[6px]">
              <p className="text text-grey500">{`$${formatPrice(
                Number(currentBounty?.escrow?.amount)
              )}`}</p>
              <Link
                href={getSolscanAddress(
                  new PublicKey(currentBounty?.escrow?.publicKey)
                )}
                target="true"
              >
                <ExternalLink className="text-grey500" width={12} height={12} />
              </Link>
            </div>
          ) : (
            <FundCTA />
          )}
        </div>
        <div className="flex px-5 gap-2">
          {currentBounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentBounty.tags
                .filter((tag) => tag.name !== "")
                .map((tag) => (
                  <div
                    className="text-grey600 text-center text-mini bg-grey100 w-fit px-2 py-1 rounded-lg border border-grey200"
                    key={tag.name}
                  >
                    {tag.name}
                  </div>
                ))}
            </div>
          )}
          <div
            className={cn(
              "text-xs text-center w-fit px-2 py-1 rounded-lg border",
              {
                "text-grey600 bg-[#CBE4A1] border-[#C0D998]": [
                  BountyState.NEW,
                  BountyState.ACCEPTING_APPLICATIONS,
                ].includes(currentBounty.state as BountyState),
                "text-grey600 bg-[#EDC9FF] border-[#E2C2F2]":
                  currentBounty.state === BountyState.IN_PROGRESS,
                "text-white bg-[#3D3D3D] border-[#333]":
                  currentBounty.state === BountyState.COMPLETE,
                "text-grey600 bg-[#FFBCB5] border-[#F2B0AA]":
                  currentBounty.state === BountyState.AWAITING_REVIEW,
                "text-white bg-[#999] border-[#8C8C8C]":
                  currentBounty.state === BountyState.CANCELED,
                "text-white bg-[#B26B9B] border-[#A66390]":
                  currentBounty.state === BountyState.VOTING_TO_CANCEL,
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
        <div
          className={`flex justify-between ${dropdownOpen ? "pb-[10px]" : ""}`}
        >
          <p className="text font-bold text-grey600">Job Description</p>
          <button
            className="h-full"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {dropdownOpen ? (
              <ChevronDown width={12} height={20} />
            ) : (
              <ChevronUp width={12} height={20} />
            )}
          </button>
        </div>
        <p
          className={`leading-[25.2px] text-sm text-grey500 ${
            dropdownOpen ? "" : "hidden"
          }`}
          dangerouslySetInnerHTML={previewMarkup()}
        />
      </div>
    </div>
  );
};

export default QuestDetails;
