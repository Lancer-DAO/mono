import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { api, decimalToNumber, getSolscanAddress } from "@/utils";
import { marked } from "marked";
import dayjs from "dayjs";
import { PublicKey } from "@solana/web3.js";
import { Clock } from "react-feather";
import { ContributorInfo, ExternalLinkIcon, Logo } from "@/components";
import { SubmitterSection, BountyActions } from "./components";
import { useUserWallet } from "@/src/providers";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { User } from "@prisma/client";

interface BountyActionsUserProps {
  title: string;
  users: User[];
}

const BountActionsUser: FC<BountyActionsUserProps> = ({ title, users }) => (
  <>
    <label className="font-bold text-sm">{title}</label>
    {users.map((user, index) => (
      <ContributorInfo user={user} key={index} />
    ))}
  </>
);

export const Bounty = () => {
  const { currentUser } = useUserWallet();
  const router = useRouter();
  const { data: currentBounty } = api.bounties.getBounty.useQuery(
    {
      id: parseInt(router.query.quest as string),
      currentUserId: currentUser?.id,
    },
    {
      enabled: !!currentUser,
    }
  );

  const [pollId, setPollId] = useState(null);
  const [links, setLinks] = useState<string[]>([]);

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

  useEffect(() => {
    const setFuturePoll = () => {
      setPollId(setTimeout(() => setFuturePoll(), 5000));
    };
    if (!pollId) {
      setPollId(setTimeout(() => setFuturePoll(), 5000));
    }
  }, []);

  useEffect(() => {
    if (currentBounty?.links) {
      const links = currentBounty?.links?.split(",");
      setLinks(links);
    }
  }, [currentBounty]);

  if (!currentUser || !currentBounty) {
    return null;
  }

  return (
    <>
      <div className="w-full h-full flex justify-evenly mt-10">
        {/* quest info */}
        <div className="flex flex-col gap-5 w-[380px]">
          {currentBounty?.state && (
            <div className="bg-white w-fit px-3 py-2 rounded-md">
              <p className="text-sm">{formatString(currentBounty?.state)}</p>
            </div>
          )}
          <h1>{currentBounty?.title}</h1>
          <div className="flex gap-5 items-center">
            <div className="flex gap-2 items-center">
              <p>
                {`Created: ${dayjs
                  .unix(parseInt(currentBounty.createdAt) / 1000)
                  .format("MMM D, YYYY")}`}
              </p>
              <div className="h-[30px] w-[1px] bg-neutralBtnBorder mx-3" />
              <Image
                src={currentBounty?.escrow?.mint?.logo}
                width={25}
                height={25}
                alt="mint logo"
              />
              <p>{`${decimalToNumber(currentBounty.escrow.amount).toFixed(
                2
              )} in escrow`}</p>
              <motion.a
                {...smallClickAnimation}
                href={getSolscanAddress(
                  new PublicKey(currentBounty?.escrow?.publicKey)
                )}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLinkIcon />
              </motion.a>
            </div>
          </div>
          <div className="h-[1px] w-full bg-neutralBtnBorder" />
          <div>
            <p className="font-bold text-sm">Job description</p>
            <div dangerouslySetInnerHTML={previewMarkup()} className="pt-1" />
          </div>
          {currentBounty.links.length > 0 && currentBounty.links[0] !== "" && (
            <div>
              <p className="font-bold text-sm">Links</p>
              <div className="flex flex-col w-full gap-1">
                {links?.map((link) => {
                  const formattedLink =
                    link.startsWith("http://") || link.startsWith("https://")
                      ? link
                      : `http://${link}`;
                  return (
                    <a
                      href={formattedLink}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-blue-500"
                      key={link}
                    >
                      {formattedLink}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
          {currentBounty.tags.length > 0 &&
            currentBounty.tags[0].name !== "" && (
              <div>
                <p className="font-bold text-sm">Required skills</p>
                <div className="flex flex-wrap w-full gap-2 pt-2">
                  {currentBounty.tags.map((tag) => (
                    <div
                      className="bg-white w-fit px-2 py-1 text-sm rounded-md"
                      key={tag.name}
                      // style={{ color: tag.color }}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
        {/* bountyactions */}
        <div className="bg-white w-[540px] h-fit rounded-md flex flex-col gap-10 p-10">
          <div className="flex flex-col gap-5" id="contributors-section">
            {currentBounty?.creator && (
              <BountActionsUser
                title="Client"
                users={[currentBounty.creator.user]}
              />
            )}
            {currentBounty && currentBounty.deniedRequesters.length > 0 && (
              <BountActionsUser
                title="Denied Requesters"
                users={currentBounty.deniedRequesters.map(
                  (submitter) => submitter.user
                )}
              />
            )}
            {currentBounty &&
              currentBounty.requestedSubmitters.length > 0 &&
              currentBounty.isCreator && (
                <>
                  <label className="font-bold text-sm">
                    Requested Applicants
                  </label>
                  {currentBounty.requestedSubmitters.map((submitter, index) => (
                    <SubmitterSection
                      submitter={submitter}
                      type="requested"
                      key={`requested-submitters-${submitter.userid}`}
                      index={index}
                    />
                  ))}
                </>
              )}

            {currentBounty &&
              currentBounty.approvedSubmitters.length > 0 &&
              currentBounty.isCreator && (
                <>
                  <label className="font-bold text-sm">
                    Approved Applicants
                  </label>
                  {currentBounty.approvedSubmitters.map((submitter, index) => (
                    <SubmitterSection
                      submitter={submitter}
                      type="approved"
                      key={`approved-submitters-${submitter.userid}`}
                      index={index}
                    />
                  ))}
                </>
              )}
            {currentBounty &&
              currentBounty.currentSubmitter &&
              currentBounty.isCreator && (
                <BountActionsUser
                  title="Submissions"
                  users={[currentBounty.currentSubmitter.user]}
                />
              )}
            {currentBounty.isCreator &&
              currentBounty.changesRequestedSubmitters.length > 0 && (
                <BountActionsUser
                  title="Changes Requested"
                  users={currentBounty.changesRequestedSubmitters.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            {currentBounty.isCreator &&
              currentBounty.deniedSubmitters.length > 0 && (
                <BountActionsUser
                  title="Denied Submitters"
                  users={currentBounty.deniedSubmitters.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            {currentBounty.completer && (
              <BountActionsUser
                title="Completed By"
                users={[currentBounty.completer.user]}
              />
            )}
            {currentBounty.isCreator &&
              currentBounty.votingToCancel.length > 0 && (
                <BountActionsUser
                  title="Voting To Cancel"
                  users={currentBounty.votingToCancel.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            {currentBounty.isCreator &&
              currentBounty.needsToVote.length > 0 && (
                <BountActionsUser
                  title="Votes Needed to Cancel"
                  users={currentBounty.needsToVote.map(
                    (submitter) => submitter.user
                  )}
                />
              )}
            <BountyActions />
          </div>
        </div>
      </div>
    </>
  );
};
