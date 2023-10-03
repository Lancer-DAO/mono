import { Dialog, DialogContent, DialogTrigger } from "@/components/atoms/Modal";
import { useBounty } from "@/src/providers/bountyProvider";
import {
  api,
  bountyIndustryColor,
  cn,
  formatPrice,
  formatString,
  getSolscanAddress,
} from "@/src/utils";
import { BountyState } from "@/types";
import { PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import { marked } from "marked";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from "react-feather";
import { ArchiveBounty } from ".";

const Divider = () => <div className="h-[20px] w-[1px] mx-4 bg-slate-200" />;

const QuestDetails = () => {
  const [dropdownOpenDetails, setDropdownOpenDetails] = useState(true);
  const { currentBounty } = useBounty();
  const { data: questMedia } = api.media.getMediaByBounty.useQuery(
    {
      bountyId: currentBounty.id,
    },
    {
      enabled: !!currentBounty.id,
    }
  );

  const industryColor = bountyIndustryColor(currentBounty.industries[0].name);

  const router = useRouter();

  const previewMarkup = () => {
    const markdown = marked.parse(currentBounty.description, { breaks: true });
    return { __html: markdown };
  };

  const bountyStateColor = (state: string) => {
    return {
      "text-neutral600 bg-[#CBE4A1] border-[#C0D998]": [
        BountyState.ACCEPTING_APPLICATIONS,
      ].includes(state as BountyState),
      "text-neutral600 bg-[#EDC9FF] border-[#E2C2F2]": [
        BountyState.IN_PROGRESS,
        BountyState.REVIEWING_SHORTLIST,
      ].includes(state as BountyState),
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
      className="flex flex-col bg-white w-[610px] 2xl:w-[750px] h-fit 
      border border-neutral200 rounded-lg"
    >
      {/* quest header */}
      <div className="flex w-full justify-between items-center">
        <div className="flex w-full flex-col items-start px-4 py-6">
          {/* back arrow */}
          <div className="w-full flex items-center pb-1 gap-2">
            <ArrowLeft
              className="text-neutral400 cursor-pointer"
              width={16}
              height={16}
              onClick={() => router.push("/")}
            />
            <h2 className="text-neutral600 font-bold">
              {currentBounty?.title}
            </h2>
            <div className="flex items-center gap-1 ml-auto pr-4">
              <ArchiveBounty />
              {currentBounty.isExternal && (
                <div className="ml-auto">
                  <Link
                    href={currentBounty.links}
                    passHref
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <button
                      className="whitespace-nowrap p-3 bg-primary200 text-white title-text 
                      text-center rounded-md border flex items-center justify-between gap-1"
                    >
                      Go To Quest{" "}
                      <ExternalLink
                        className="text-white"
                        width={20}
                        height={20}
                      />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          {/* quest info */}
          <div className="w-full flex items-center pb-2.5 px-6">
            <p className="text text-neutral500">
              {`Created on ${dayjs
                .unix(parseInt(currentBounty.createdAt) / 1000)
                .format("D MMM YYYY")}`}
            </p>
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
            {currentBounty?.isExternal && currentBounty.price && (
              <div className="flex items-center gap-1.5">
                <Divider />
                <p className="text text-neutral500">{`$${formatPrice(
                  Number(currentBounty?.price)
                )}`}</p>
              </div>
            )}
          </div>
          <div className="flex px-5 gap-2">
            <div
              className={cn(
                "text-xs text-center w-fit px-2 py-1 rounded-lg border",
                industryColor
              )}
            >
              {formatString(currentBounty.industries[0].name)}
            </div>
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
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-neutral200" />
      {/* quest content */}
      {currentBounty.state !== BountyState.CANCELED && (
        <>
          <div
            className={`px-10 pt-4 flex justify-between ${
              dropdownOpenDetails ? "" : "pb-4"
            }`}
          >
            <p
              className={`text font-bold text-neutral600 ${
                !dropdownOpenDetails ? "" : "pb-2.5"
              }`}
            >
              Job Description
            </p>
            <button
              className="h-full"
              onClick={() => setDropdownOpenDetails(!dropdownOpenDetails)}
            >
              {dropdownOpenDetails ? (
                <ChevronUp width={12} height={20} />
              ) : (
                <ChevronDown width={12} height={20} />
              )}
            </button>
          </div>
          <div
            className={`flex flex-col gap-6 ${
              dropdownOpenDetails ? "" : "hidden"
            }`}
          >
            <p
              className={`px-10 leading-[25.2px] text-sm text-neutral500 ${
                !dropdownOpenDetails &&
                !currentBounty.links &&
                questMedia.length === 0
                  ? ""
                  : "pb-4"
              }`}
              dangerouslySetInnerHTML={previewMarkup()}
            />
            {currentBounty.links !== "" && (
              <div className="px-10 pb-4">
                <div className={`flex justify-between pb-[10px]`}>
                  <div className="text font-bold text-neutral600">
                    Additional Links
                  </div>
                </div>
                <div className={`relative w-full flex flex-col gap-2`}>
                  {currentBounty.links
                    .split(",")
                    .map((link: string, index: number) => (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-sm border bg-neutral-100 truncate
                        border-neutral-200 w-full rounded-md px-4 py-2"
                        key={`link-${index}`}
                      >
                        {link}
                      </a>
                    ))}
                </div>
              </div>
            )}
            {questMedia?.length > 0 && (
              <div className="px-10 pb-6">
                <div className={`flex justify-between pb-[10px]`}>
                  <div className="text font-bold text-neutral600">
                    Reference Media
                  </div>
                </div>
                <div className={`grid grid-cols-3 gap-4`}>
                  {questMedia?.map((med, index) => {
                    return (
                      <Dialog key={index}>
                        <div className="relative" key={index}>
                          <DialogTrigger
                            className="relative border-2 border-neutral200 rounded-[4px] w-[150px] h-[90px] overflow-hidden"
                            key={`dialog-${index}`}
                          >
                            <Image
                              src={med.imageUrl}
                              alt={med.title}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          </DialogTrigger>
                        </div>
                        <DialogContent className="w-2/3 flex flex-col gap-3 items-center p-6">
                          <div
                            className="relative gap-5 w-full h-[240px] 
                        overflow-hidden mt-4 rounded-md border-2 border-neutral200"
                          >
                            <Image
                              src={med.imageUrl}
                              alt={med.title}
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                          {med.title && (
                            <div className="w-full flex items-center gap-3 text-sm text-neutral600">
                              <p className="w-32 text-left">Title</p>
                              <p className="w-full text-left p-2 bg-neutral100 border border-neutral200 rounded-md">
                                {med.title}
                              </p>
                            </div>
                          )}
                          {med.description && (
                            <div className="w-full flex items-center gap-3 text-sm">
                              <p className="w-32 text-left">Description</p>
                              <p className="w-full text-left p-2 bg-neutral100 border border-neutral200 rounded-md">
                                {med.description}
                              </p>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestDetails;
