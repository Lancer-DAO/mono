import { Clock, EyeOff } from "react-feather";
import { marked } from "marked";
import { Bounty, BOUNTY_USER_RELATIONSHIP, Contributor } from "@/src/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { decimalToNumber } from "@/src/utils";
import { ContributorInfo } from "@/components";
import { useState } from "react";
import Image from "next/image";
dayjs.extend(relativeTime);

const LancerBounty = ({
  bounty,
  id,
}: {
  bounty: Bounty & { users: Contributor[] };
  id?: string;
}) => {
  const [isPrivateHovered, setIsPrivateHovered] = useState(false);
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
      className="companies-card"
    >
      <a
        href={`/bounties/${bounty.id}`}
        className="company-card-link-wrapper w-inline-block"
      >
        <div className="bounty-card-content">
          <div className="flex items-center">
            <h2 className="heading no-padding-margin">{bounty.title}</h2>
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
          <div className="container-3">
            <div
              className="bounty-markdown-preview"
              dangerouslySetInnerHTML={previewMarkup()}
            />
          </div>
          <div className="spacer-filled" />
          <div className="bounty-footer">
            <div className="bounty-card-funder">
              <div className="contributor-picture">
                <Clock size={"36px"} color="#14bb88" />
              </div>

              <div className="bounty-funder-text">
                <h3 className="no-padding-margin">
                  {bounty.estimatedTime.toString()} HRS
                </h3>
                <div>
                  Created:{" "}
                  {dayjs.unix(parseInt(bounty.createdAt) / 1000).fromNow()}
                </div>
              </div>
            </div>
            <div className="tag-list">
              {bounty.tags.map((tag) => (
                <div className="tag-item" key={tag.name}>
                  {tag.name}
                </div>
              ))}
            </div>
          </div>
          <div className="spacer" />

          <div className="bounty-footer">
            <div className="bounty-card-funder">
              {creator && <ContributorInfo user={creator.user} />}
            </div>
            <div className="bounty-funding">
              <h3 className="no-padding-margin">{bountyAmount}</h3>
              <Image
                className="rounded-[50%]"
                src={bounty.escrow.mint.logo}
                alt={bounty.escrow.mint.name}
                width={36}
                height={36}
              />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
};

export default LancerBounty;
