import { useState } from "react";
import { useBounty } from "@/src/providers/bountyProvider";
import { cn, formatPrice, getSolscanAddress } from "@/src/utils";
import { BountyState } from "@/types";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import { marked } from "marked";
import Link from "next/link";
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

  const bountyStateColor = (state: string) => {
    return {
      "text-neutral600 bg-[#CBE4A1] border-[#C0D998]": [
        BountyState.NEW,
        BountyState.ACCEPTING_APPLICATIONS,
      ].includes(state as BountyState),
      "text-neutral600 bg-[#EDC9FF] border-[#E2C2F2]":
        state === BountyState.IN_PROGRESS,
      "text-white bg-[#3D3D3D] border-[#333]": state === BountyState.COMPLETE,
      "text-neutral600 bg-[#FFBCB5] border-[#F2B0AA]":
        state === BountyState.AWAITING_REVIEW,
      "text-white bg-[#999] border-[#8C8C8C]": state === BountyState.CANCELED,
      "text-white bg-[#B26B9B] border-[#A66390]":
        state === BountyState.VOTING_TO_CANCEL,
    };
  };

  return (
    <div
      className="flex flex-col bg-white min-w-[610px] w-full h-fit 
      border border-neutral200 rounded-lg"
    >
      {/* quest header */}
      <div className="flex flex-col items-start px-4 py-6">
        {/* back arrow */}
        <div className="flex items-center pb-1 gap-2">
          <Link href="/quests">
            <ArrowLeft className="text-neutral400" width={16} height={16} />
          </Link>
          <h2 className="text-neutral600 font-bold">{currentBounty?.title}</h2>
        </div>
        {/* quest info */}
        <div className="flex items-center pb-[10px] px-6">
          <p className="text text-neutral500">{`Created on ${dayjs
            .unix(parseInt(currentBounty.createdAt) / 1000)
            .format("D MMM YYYY")}`}</p>
          {/* TODO: either add back estimated time or remove from design */}
          {/* <Divider />
          <p className="text text-neutral500">{`${currentBounty.estimatedTime.toString()} ${
            Number(currentBounty.estimatedTime) > 1 ? "hours" : "hour"
          }`}</p> */}
            {/* <Link
              href={getSolscanAddress(
                new PublicKey(currentBounty?.escrow?.publicKey)
              )}
              target="true"
            > */}
            {currentBounty?.escrow && (
              <div className="flex items-center gap-1.5">
              <Divider />
              <p className="text text-neutral500">{`$${formatPrice(
                Number(currentBounty?.escrow?.amount)
              )}`}</p>
              <Link
                href={getSolscanAddress(
                  new PublicKey(currentBounty?.escrow?.publicKey)
                )}
                target="_blank"
              >
                <ExternalLink
                  className="text-neutral500"
                  width={12}
                  height={12}
                />
              </Link>
              </div>
            )}
        </div>
        <div className="flex px-5 gap-2">
          {currentBounty.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentBounty.tags
                .filter((tag) => tag.name !== "")
                .map((tag) => (
                  <div
                    className="text-neutral600 text-center text-mini bg-neutral100 w-fit px-2 py-1 rounded-lg border border-neutral200"
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
              bountyStateColor(currentBounty.state)
            )}
          >
            {formatString(currentBounty.state)}
          </div>
          {currentBounty.isExternal && (
            <div>
              <Link href={currentBounty.links} passHref>
                <button className="bg-errorBg text-xs text-center w-fit px-2 py-1 rounded-lg border">
                  Go To Quest
                </button>
              </Link>
            </div>
          )}
        </div>
        
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      {/* quest content */}
      <div className="px-10 py-4">
        <div
          className={`flex justify-between ${dropdownOpen ? "pb-[10px]" : ""}`}
        >
          <p className="text font-bold text-neutral600">Job Description</p>
          <button
            className="h-full"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {dropdownOpen ? (
              <ChevronUp width={12} height={20} />
            ) : (
              <ChevronDown width={12} height={20} />
            )}
          </button>
        </div>
        <p
          className={`leading-[25.2px] text-sm text-neutral500 ${
            dropdownOpen ? "" : "hidden"
          }`}
          dangerouslySetInnerHTML={previewMarkup()}
        />
      </div>
    </div>
  );
};

export default QuestDetails;
