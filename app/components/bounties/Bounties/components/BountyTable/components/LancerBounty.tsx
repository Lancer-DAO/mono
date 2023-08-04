import { Clock, EyeOff } from "react-feather";
import { marked } from "marked";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { decimalToNumber } from "@/src/utils";
import { ContributorInfo } from "@/components";
import { useState } from "react";
import Image from "next/image";
import { BOUNTY_USER_RELATIONSHIP, BountyPreview } from "@/types/";
dayjs.extend(relativeTime);

export const LancerBounty = ({
  bounty,
  id,
}: {
  bounty: BountyPreview;
  id?: string;
}) => {
  const search = useLocation().search;
  const [isPrivateHovered, setIsPrivateHovered] = useState(false);
  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const previewMarkup = () => {
    if (!bounty.description) return { __html: "<div/>" };

    const markdown = marked.parse(bounty.description, { breaks: true });
    return { __html: markdown };
  };

  const creator = bounty.users.find((user) =>
    user.relations.includes(BOUNTY_USER_RELATIONSHIP.Creator)
  );
  const bountyAmount = decimalToNumber(bounty.escrow.amount).toFixed(2);
  return (
    <div
      id={id}
      data-w-id="cff91d78-63a9-e923-e5c8-4e09d47abde6"
      role="listitem"
      className="companies-card h-[450px]"
    >
      <a
        href={`/bounties/${bounty.id}`}
        className="company-card-link-wrapper w-inline-block"
      >
        <div className="flex flex-col items-center w-full justify-between h-full">
          <div className="flex items-center h-fit">
            <h2 className="w-full text-left">{bounty.title}</h2>
            {bounty.isPrivate && (
              <div
                className="ml-auto relative"
                onMouseEnter={() => {
                  setIsPrivateHovered(true);
                }}
                onMouseLeave={() => {
                  setIsPrivateHovered(false);
                }}
              >
                <EyeOff size={"32px"} color="#14bb88" />
                {isPrivateHovered && (
                  <div className="absolute top-[40px] w-[400px] bg-aqua-100 justify-center rounded-[10px] p-[10px]">
                    This issue is private. Only people with the link, or active
                    contributors can see it.
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="w-full h-[150px] overflow-hidden">
            <div
              className="bounty-markdown-preview"
              dangerouslySetInnerHTML={previewMarkup()}
            />
          </div>
          <div className="spacer-filled" />
          <div className="w-full flex items-center justify-between max-w-1/2 mx-auto">
            <div className="w-full flex items-start gap-3">
              <div className="rounded-full shadow-lg w-7 h-7">
                <Clock size={"28px"} color="#14bb88" />
              </div>

              <div>
                <h3 className="p-0 m-0 text-lg whitespace-nowrap">
                  {bounty.estimatedTime.toString()} HRS
                </h3>
                <div className="text-xs">
                  Created:
                  <br />
                  {dayjs.unix(parseInt(bounty.createdAt) / 1000).fromNow()}
                </div>
              </div>
            </div>
            <div className="w-full flex items-center justify-end gap-1 px-1">
              {bounty.tags.map((tag, index) => {
                if (index > 1) return;
                return (
                  <div className="tag-item" key={tag.name}>
                    {tag.name}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full flex items-center justify-between mt-6">
            <div className="text-sm">
              {creator && <ContributorInfo user={creator.user} />}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="p-0 m-0 text-lg">{bountyAmount}</h3>
              <Image
                className="rounded-[50%]"
                src={bounty.escrow.mint.logo}
                alt={bounty.escrow.mint.name}
                width={25}
                height={25}
              />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LancerBounty;
