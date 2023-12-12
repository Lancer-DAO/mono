import { LockIcon, Logo } from "@/components";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyPreview, QuestFormData } from "@/types/";
import {
  bountyIndustryColor,
  cn,
  formatString,
  getFormattedDate,
} from "@/utils";
import { ExternalLink } from "lucide-react";
import { marked } from "marked";
import Image from "next/image";
import { FC, SVGAttributes } from "react";

interface Props extends SVGAttributes<SVGSVGElement> {
  bounty?: BountyPreview;
  formData?: QuestFormData;
  linked?: boolean;
}

export const QuestRow: FC<Props> = ({ bounty, formData, linked = true }) => {
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
      className="items-center bg-white gap-2.5 flex px-2.5 flex-col justify-center h-[125px]"
    >
      <div className="w-full flex justify-between">
        <div className="flex h-full items-center justify-center gap-2.5 max-w-1/2">
          {bounty?.creator?.user?.picture ? (
            <Image
              src={
                bounty?.creator?.user.picture
                  ? bounty?.creator?.user.picture
                  : ``
              }
              width={40}
              height={40}
              alt={bounty?.creator?.user.name}
              className="rounded-full"
            />
          ) : (
            <Logo width="40px" height="40px" />
          )}

          <div className="flex flex-col gap-1">
            <p className="text-sm text-neutral600 font-bold truncate max-w-[200px] xl:max-w-[400px]">
              {bounty.title}
            </p>
            <p className="text-sm text-neutral500">
              {bounty?.creator?.user.name ?? "Lancer"}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-5">
          <div className="flex flex-col gap-1 items-end justify-center">
            {bounty && !bounty.isExternal && Number(bounty?.escrow.amount) ? (
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
            ) : bounty.isExternal && bounty.price ? (
              <div className="flex items-center justify-center gap-1">
                <ExternalLink
                  width="14px"
                  height="14px"
                  className="text-primary200"
                />
                <p className="text-sm text-neutral600">
                  ${Number(bounty?.price).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral600">Requesting Quotes</p>
            )}

            <p className="text-sm text-right text-neutral500">
              Created on {getFormattedDate(bounty)}
            </p>
          </div>
          <a
            href={handleBountyLink()}
            className="rounded-md py-2 px-4 text-neutral600 text-sm border border-neutral200 hover:bg-neutral200"
          >
            Details
          </a>
        </div>
      </div>

      <div className="ml-24 flex flex-wrap gap-2.5 w-full">
        {bounty.industries?.length > 0 && (
          <div
            className={cn(
              "text-xs text-center w-fit px-2 py-1 rounded-lg border",
              bountyIndustryColor(bounty.industries[0].name)
            )}
          >
            {formatString(bounty.industries[0].name)}
          </div>
        )}
        {displayedTags.filter((tag) => tag !== "").length > 0 &&
          displayedTags[0] !== "" &&
          displayedTags.map((tag) => {
            if (tag === "") return null;
            return (
              <div
                className="flex items-center px-[7px] bg-neutral100 text-neutral600 text-xs rounded-md border border-neutral200"
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
