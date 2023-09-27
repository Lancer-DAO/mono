import { FC, SVGAttributes } from "react";
import { LockIcon, Logo } from "@/components";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyPreview, QuestFormData, Industry } from "@/types/";
import { getFormattedDate } from "@/utils";
import { marked } from "marked";
import Image from "next/image";

export interface BountyCardProps extends SVGAttributes<SVGSVGElement> {
  bounty?: BountyPreview;
  formData?: QuestFormData;
  linked?: boolean;
}

export const QuestRow: FC<BountyCardProps> = ({
  bounty,
  formData,
  linked = true,
}) => {
  const { currentBounty } = useBounty();

  const handleBountyLink = () => {
    if (!linked) return null;
    if (formData) {
      return `/quests/${currentBounty?.id?.toString()}`;
    } else {
      return `/quests/${bounty?.id}`;
    }
  };

  const previewMarkup = () => {
    const markdown = marked.parse(
      bounty ? bounty.description : formData.issueDescription,
      { breaks: true }
    );
    return { __html: markdown };
  };

  const displayedTags = bounty
    ? bounty.tags.slice(0, 4).map((tag) => tag.name)
    : formData.tags.slice(0, 4).map((tag) => tag);

  const tagOverflow = bounty
    ? bounty.tags.filter((tag) => tag.name !== "").length > 4
    : formData.tags.filter((tag) => tag !== "").length > 4;

  if (!bounty && !formData) return null;

  return (
    <div
      style={{
        borderBottom: "1px solid #EDF2F1",
        opacity: bounty.state == "complete" ? "80%" : "100%",
      }}
      className="items-center bg-white gap-2.5 rounded-md flex py-5 px-2.5 flex-col justify-start h-[110px] hover:bg-neutral100"
    >
      <div className="w-full flex justify-between">
        <div className="flex h-full items-center justify-center gap-2.5">
          {bounty?.creator?.user?.picture ? (
            <Image
              src={
                bounty?.creator?.user.picture
                  ? bounty?.creator?.user.picture
                  : ``
              }
              width={28}
              height={28}
              alt={bounty?.creator?.user.name}
              className="h-[28px] w-[28px] rounded-full"
            />
          ) : (
            <Logo width="28px" height="28px" />
          )}

          <div className="flex flex-col">
            <p className="text-sm text-neutral600 font-bold">
              {bounty?.creator?.user.name}
            </p>
            <p className="text-xs">{bounty.title}</p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-5">
          <div className="flex flex-col items-end justify-center">
            {bounty && Number(bounty?.escrow.amount) ? (
              <div className="flex items-center justify-center gap-1">
                <LockIcon
                  width="14px"
                  height="14px"
                  className="fill-primary200"
                />
                <p className="text-sm text-neutral600">
                  ${Number(bounty?.escrow.amount).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral600">Requesting Quotes</p>
            )}

            <p className="text-xs text-neutral500">
              Created on {getFormattedDate(bounty)}
            </p>
          </div>
          <a
            target="_blank"
            rel="noreferrer"
            href={handleBountyLink()}
            className="rounded-md py-2 px-4 text-neutral600 text-sm border border-neutral200"
          >
            Details
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 w-full">
        {displayedTags.filter((tag) => tag !== "").length > 0 &&
          displayedTags[0] !== "" &&
          displayedTags.map((tag) => {
            if (tag === "") return null;
            return (
              <div
                className="px-[7px] bg-neutral100 text-neutral600 text-xs rounded-md border border-neutral200"
                key={tag}
              >
                {tag}
              </div>
            );
          })}
        {tagOverflow && <p className="text-xs">+ more</p>}
      </div>
    </div>
  );
};